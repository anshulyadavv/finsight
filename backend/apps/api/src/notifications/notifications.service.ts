import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as nodemailer from 'nodemailer';
import * as webPush from 'web-push';
import { User } from '../users/user.entity';
import { Insight, InsightSeverity } from '../insights/insight.entity';
import { Anomaly } from '../anomalies/anomaly.entity';
import { Notification, NotificationType } from './notification.entity';
import { Transaction, TransactionType } from '../transactions/transaction.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(Notification) private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Insight) private readonly insightRepo: Repository<Insight>,
    @InjectRepository(Anomaly) private readonly anomalyRepo: Repository<Anomaly>,
    @InjectRepository(Transaction) private readonly txRepo: Repository<Transaction>,
    private readonly configService: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: configService.get('SMTP_HOST') || 'smtp.gmail.com',
      port: parseInt(configService.get('SMTP_PORT') || '587'),
      secure: configService.get('SMTP_SECURE') === 'true',
      auth: {
        user: configService.get('SMTP_USER'),
        pass: configService.get('SMTP_PASS'),
      },
    });

    const vapidPublic = configService.get<string>('VAPID_PUBLIC_KEY');
    const vapidPrivate = configService.get<string>('VAPID_PRIVATE_KEY');
    if (vapidPublic && vapidPrivate) {
      webPush.setVapidDetails(
        `mailto:${configService.get('VAPID_EMAIL') || 'noreply@finsight.app'}`,
        vapidPublic,
        vapidPrivate,
      );
    }
  }

  // ─── Persistence Logic ───────────────────────────────────────────────

  async create(user: User, data: Partial<Notification>) {
    const notify = this.notificationRepo.create({
      ...data,
      user,
      isRead: false,
      isArchived: false,
    });
    return this.notificationRepo.save(notify);
  }

  async list(user: User) {
    return this.notificationRepo.find({
      where: { user: { id: user.id }, isArchived: false },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markAsRead(id: string) {
    return this.notificationRepo.update(id, { isRead: true });
  }

  async markAllAsRead(user: User) {
    return this.notificationRepo.update({ user: { id: user.id }, isRead: false }, { isRead: true });
  }

  async archive(id: string) {
    return this.notificationRepo.update(id, { isArchived: true });
  }

  // ─── Alerts ──────────────────────────────────────────────────────────

  async sendAnomalyAlert(userId: string, anomaly: Anomaly) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return;

    // Persist in-app notification
    await this.create(user, {
      title: '⚠️ Anomaly Detected',
      message: anomaly.message,
      type: NotificationType.ANOMALY,
      metadata: { anomalyId: anomaly.id },
    });

    const payload = {
      title: '⚠️ Anomaly Detected',
      body: anomaly.message,
      icon: '/icons/alert.png',
      data: { type: 'anomaly', id: anomaly.id },
    };

    if (user.notificationPush && user.pushSubscription) {
      await this.sendPush(user.pushSubscription, payload);
    }

    if (user.notificationEmail) {
      await this.sendEmail(user.email, '⚠️ Unusual Transaction Detected — FinSight', `
        <h2>Anomaly Alert</h2>
        <p>${anomaly.message}</p>
        <p>Please review your recent transactions in the FinSight dashboard.</p>
      `);
    }
  }

  // ─── Internal Helpers ────────────────────────────────────────────────

  private async sendEmail(to: string, subject: string, html: string) {
    if (!this.configService.get('SMTP_USER')) {
      this.logger.debug(`[EMAIL SKIPPED] To: ${to}, Subject: ${subject}`);
      return;
    }
    await this.transporter.sendMail({
      from: `"FinSight" <${this.configService.get('SMTP_USER')}>`,
      to,
      subject,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">${html}</div>`,
    });
  }

  private async sendPush(subscription: object, payload: object) {
    try {
      await webPush.sendNotification(
        subscription as webPush.PushSubscription,
        JSON.stringify(payload),
      );
    } catch (err) {
      this.logger.warn(`Push notification failed: ${(err as Error).message}`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async sendDailyDigest() {
    this.logger.log('Sending daily digest notifications…');
    const users = await this.userRepo.find({
      where: { isActive: true, notificationEmail: true },
    });

    for (const user of users) {
      try {
        await this.sendDailyDigestEmail(user);
      } catch (err) {
        this.logger.error(`Digest failed for ${user.email}: ${(err as Error).message}`);
      }
    }
  }

  private async sendDailyDigestEmail(user: User) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);

    const [income, expenses, anomalyCount, unreadInsights] = await Promise.all([
      this.sumType(user.id, TransactionType.INCOME, start, now),
      this.sumType(user.id, TransactionType.EXPENSE, start, now),
      this.anomalyRepo.count({ where: { userId: user.id, isResolved: false } }),
      this.insightRepo.count({ where: { userId: user.id, isRead: false } }),
    ]);

    const savings = income - expenses;

    await this.sendEmail(
      user.email,
      `💰 Your FinSight Daily — ${now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}`,
      `<h2>Good morning, ${user.name}!</h2>
       <table>
         <tr><td>Monthly Income</td><td>₹${income.toLocaleString('en-IN')}</td></tr>
         <tr><td>Monthly Expenses</td><td>₹${expenses.toLocaleString('en-IN')}</td></tr>
         <tr><td>Net Savings</td><td>₹${savings.toLocaleString('en-IN')}</td></tr>
       </table>
       ${anomalyCount > 0 ? `<p>⚠️ ${anomalyCount} unresolved anomalies detected.</p>` : ''}
       ${unreadInsights > 0 ? `<p>💡 ${unreadInsights} new insights available.</p>` : ''}`,
    );
  }

  private async sumType(userId: string, type: TransactionType, start: Date, end: Date): Promise<number> {
    const r = await this.txRepo
      .createQueryBuilder('tx')
      .select('COALESCE(SUM(tx.amount), 0)', 'total')
      .where('tx.userId = :userId AND tx.type = :type', { userId, type })
      .andWhere('tx.date BETWEEN :start AND :end', { start, end })
      .getRawOne<{ total: string }>();
    return parseFloat(r?.total ?? '0');
  }
}

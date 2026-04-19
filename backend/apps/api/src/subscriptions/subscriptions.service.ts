import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Subscription } from './subscription.entity';
import { Transaction, TransactionType, PaymentMethod } from '../transactions/transaction.entity';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    @InjectRepository(Subscription)
    private subRepo: Repository<Subscription>,
    @InjectRepository(Transaction)
    private txRepo: Repository<Transaction>,
  ) {}

  async findAll(userId: string): Promise<Subscription[]> {
    return this.subRepo.find({ where: { userId, active: true }, order: { createdAt: 'DESC' } });
  }

  async create(userId: string, data: Partial<Subscription>): Promise<Subscription> {
    const sub = this.subRepo.create({ ...data, userId });
    return this.subRepo.save(sub);
  }

  async update(userId: string, id: string, data: Partial<Subscription>): Promise<Subscription> {
    const sub = await this.subRepo.findOne({ where: { id, userId } });
    if (!sub) throw new Error('Subscription not found');
    Object.assign(sub, data);
    return this.subRepo.save(sub);
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.subRepo.delete({ id, userId });
  }

  // Runs every day at 1:00 AM to process subscriptions
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async processSubscriptions() {
    this.logger.log('Processing recurring subscriptions...');
    const today = new Date();
    const day = today.getDate();

    // Find all active subscriptions billing on this day
    const subs = await this.subRepo.find({ where: { active: true, billingDay: day } });

    for (const sub of subs) {
      if (this.shouldBill(sub, today)) {
        await this.createTransactionForSub(sub, today);
      }
    }
  }

  private shouldBill(sub: Subscription, today: Date): boolean {
    if (!sub.lastBilledDate) return true;

    const last = new Date(sub.lastBilledDate);
    const monthsDiff = (today.getFullYear() - last.getFullYear()) * 12 + today.getMonth() - last.getMonth();

    switch (sub.billingCycle) {
      case 'yearly':    return monthsDiff >= 12;
      case 'quarterly': return monthsDiff >= 3;
      case 'monthly':
      default:          return monthsDiff >= 1;
    }
  }

  private async createTransactionForSub(sub: Subscription, date: Date) {
    // Create transaction
    const tx = this.txRepo.create({
      userId: sub.userId,
      amount: sub.cost,
      type: TransactionType.EXPENSE,
      date: date,
      paymentMethod: PaymentMethod.CARD, 
      description: `Auto-subscription: ${sub.name}`,
      isRecurring: true,
      recurringId: sub.id,
      metadata: { subscriptionId: sub.id, cycle: sub.billingCycle }
    });

    await this.txRepo.save(tx);
    
    // Update last billed date
    sub.lastBilledDate = date;
    await this.subRepo.save(sub);

    this.logger.log(`Created ${sub.billingCycle} subscription transaction for user ${sub.userId} (${sub.name})`);
  }
}

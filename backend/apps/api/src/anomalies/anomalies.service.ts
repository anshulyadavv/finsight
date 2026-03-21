import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Anomaly, AnomalyType } from './anomaly.entity';
import { Transaction, TransactionType } from '../transactions/transaction.entity';

@Injectable()
export class AnomaliesService {
  private readonly logger = new Logger(AnomaliesService.name);

  constructor(
    @InjectRepository(Anomaly)
    private readonly anomalyRepo: Repository<Anomaly>,
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getAnomalies(userId: string) {
    return this.anomalyRepo.find({
      where: { userId, isResolved: false },
      relations: ['transaction'],
      order: { createdAt: 'DESC' },
      take: 10,
    });
  }

  async resolve(userId: string, id: string) {
    await this.anomalyRepo.update(
      { id, userId },
      { isResolved: true, resolvedAt: new Date() },
    );
  }

  // ─── Main detection pipeline ──────────────────────────────────────────────

  async detectAnomalies(userId: string, transactionId: string): Promise<void> {
    const tx = await this.txRepo.findOne({
      where: { id: transactionId, userId },
      relations: ['category'],
    });
    if (!tx || tx.type !== TransactionType.EXPENSE) return;

    const anomalies: Partial<Anomaly>[] = [];

    // 1. Z-score spike detection
    const zAnomaly = await this.detectZScoreAnomaly(userId, tx);
    if (zAnomaly) anomalies.push(zAnomaly);

    // 2. Duplicate charge detection
    const dupAnomaly = await this.detectDuplicate(userId, tx);
    if (dupAnomaly) anomalies.push(dupAnomaly);

    // 3. Category jump detection
    const catAnomaly = await this.detectCategoryJump(userId, tx);
    if (catAnomaly) anomalies.push(catAnomaly);

    // 4. ML Isolation Forest (optional, calls Python service)
    try {
      const mlAnomaly = await this.callMlAnomalyService(userId, tx);
      if (mlAnomaly) anomalies.push(mlAnomaly);
    } catch {
      this.logger.warn('ML anomaly service unavailable, using rule-based only');
    }

    if (anomalies.length > 0) {
      const entities = anomalies.map((a) =>
        this.anomalyRepo.create({ userId, transactionId, ...a }),
      );
      await this.anomalyRepo.save(entities);
      this.logger.log(`Detected ${entities.length} anomalies for tx ${transactionId}`);
    }
  }

  // ─── Z-Score ──────────────────────────────────────────────────────────────

  private async detectZScoreAnomaly(
    userId: string,
    tx: Transaction,
  ): Promise<Partial<Anomaly> | null> {
    if (!tx.categoryId) return null;

    const stats = await this.txRepo
      .createQueryBuilder('t')
      .select('AVG(t.amount)', 'mean')
      .addSelect('STDDEV(t.amount)', 'stddev')
      .addSelect('COUNT(*)', 'count')
      .where('t.userId = :userId', { userId })
      .andWhere('t.categoryId = :catId', { catId: tx.categoryId })
      .andWhere('t.type = :type', { type: TransactionType.EXPENSE })
      .andWhere('t.id != :txId', { txId: tx.id })
      .getRawOne<{ mean: string; stddev: string; count: string }>();

    const count  = parseInt(stats?.count ?? '0');
    const mean   = parseFloat(stats?.mean ?? '0');
    const stddev = parseFloat(stats?.stddev ?? '0');

    if (count < 5 || stddev === 0) return null;

    const zScore = (Number(tx.amount) - mean) / stddev;

    if (Math.abs(zScore) > 2.5) {
      return {
        type:         AnomalyType.SUDDEN_SPIKE,
        message:      `Unusual spending detected: ₹${tx.amount} in ${tx.category?.name || 'this category'} (${zScore.toFixed(1)}σ above average)`,
        anomalyScore: Math.min(1, Math.abs(zScore) / 5),
        zScore,
        data: { mean: Math.round(mean), stddev: Math.round(stddev), amount: tx.amount },
      };
    }

    return null;
  }

  // ─── Duplicate Detection ──────────────────────────────────────────────────

  private async detectDuplicate(
    userId: string,
    tx: Transaction,
  ): Promise<Partial<Anomaly> | null> {
    if (!tx.merchant) return null;

    const since = new Date(tx.date);
    since.setDate(since.getDate() - 1);

    const duplicate = await this.txRepo.findOne({
      where: {
        userId,
        merchant: tx.merchant,
        amount: tx.amount as unknown as number,
      },
    });

    if (duplicate && duplicate.id !== tx.id) {
      return {
        type:         AnomalyType.DUPLICATE,
        message:      `Possible duplicate charge: ₹${tx.amount} at ${tx.merchant}`,
        anomalyScore: 0.9,
        data:         { originalId: duplicate.id, merchant: tx.merchant, amount: tx.amount },
      };
    }

    return null;
  }

  // ─── Category Jump ────────────────────────────────────────────────────────

  private async detectCategoryJump(
    userId: string,
    tx: Transaction,
  ): Promise<Partial<Anomaly> | null> {
    if (!tx.categoryId) return null;

    const now   = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);

    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0);

    const [curSpend, prevSpend] = await Promise.all([
      this.sumCategory(userId, tx.categoryId, start, now),
      this.sumCategory(userId, tx.categoryId, prevMonthStart, prevMonthEnd),
    ]);

    if (prevSpend === 0 || curSpend <= prevSpend * 2) return null;

    const changePct = ((curSpend - prevSpend) / prevSpend) * 100;

    return {
      type:         AnomalyType.CATEGORY_JUMP,
      message:      `Unusual spike in ${tx.category?.name || 'category'} spending — ${Math.round(changePct)}% above last month`,
      anomalyScore: Math.min(1, changePct / 300),
      data: { category: tx.category?.name, currentMonthTotal: curSpend, prevMonthTotal: prevSpend, changePct: Math.round(changePct) },
    };
  }

  // ─── ML Service ───────────────────────────────────────────────────────────

  private async callMlAnomalyService(
    userId: string,
    tx: Transaction,
  ): Promise<Partial<Anomaly> | null> {
    const baseUrl = this.configService.get<string>('ml.baseUrl');
    const response = await firstValueFrom(
      this.httpService.post(`${baseUrl}/detect-anomaly`, {
        user_id:      userId,
        amount:       tx.amount,
        category:     tx.category?.name,
        merchant:     tx.merchant,
        day_of_week:  new Date(tx.date).getDay(),
        hour:         new Date(tx.date).getHours(),
      }),
    );

    const responseData = (response as any).data as { anomaly_score: number; is_anomaly: boolean };
    const { anomaly_score, is_anomaly } = responseData;

    if (!is_anomaly || anomaly_score < 0.7) return null;

    return {
      type:         AnomalyType.MERCHANT,
      message:      `ML detected unusual transaction pattern at ${tx.merchant || 'unknown merchant'}`,
      anomalyScore: anomaly_score,
      data:         { mlScore: anomaly_score },
    };
  }

  private async sumCategory(
    userId: string, categoryId: string, start: Date, end: Date,
  ): Promise<number> {
    const r = await this.txRepo
      .createQueryBuilder('tx')
      .select('COALESCE(SUM(tx.amount), 0)', 'total')
      .where('tx.userId = :userId', { userId })
      .andWhere('tx.categoryId = :catId', { catId: categoryId })
      .andWhere('tx.type = :type', { type: TransactionType.EXPENSE })
      .andWhere('tx.date BETWEEN :start AND :end', { start, end })
      .getRawOne<{ total: string }>();
    return parseFloat(r?.total ?? '0');
  }
}

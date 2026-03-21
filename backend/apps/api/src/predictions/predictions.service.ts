import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';
import { Transaction, TransactionType } from '../transactions/transaction.entity';

@Injectable()
export class PredictionsService {
  private readonly logger = new Logger(PredictionsService.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  async getPredictions(userId: string) {
    const cacheKey = `predictions:${userId}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    // Fetch 6 months of history for forecasting
    const since = new Date();
    since.setMonth(since.getMonth() - 6);

    const history = await this.txRepo
      .createQueryBuilder('tx')
      .select("TO_CHAR(tx.date, 'YYYY-MM-DD')", 'date')
      .addSelect('tx.type', 'type')
      .addSelect('tx.amount', 'amount')
      .addSelect('cat.name', 'category')
      .leftJoin('tx.category', 'cat')
      .where('tx.userId = :userId', { userId })
      .andWhere('tx.date > :since', { since })
      .orderBy('tx.date', 'ASC')
      .getRawMany<{ date: string; type: string; amount: string; category: string }>();

    let prediction: PredictionResult;

    try {
      prediction = await this.callMlPrediction(history);
    } catch {
      this.logger.warn('ML prediction service unavailable, using statistical fallback');
      prediction = this.statisticalFallback(history);
    }

    await this.cache.set(cacheKey, prediction, 3600); // Cache 1 hour
    return prediction;
  }

  // ─── ML service call ──────────────────────────────────────────────────────

  private async callMlPrediction(
    history: { date: string; type: string; amount: string; category: string }[],
  ): Promise<PredictionResult> {
    const baseUrl = this.configService.get<string>('ml.baseUrl');
    const timeout = this.configService.get<number>('ml.timeout');

    const response = await firstValueFrom(
      this.httpService.post(
        `${baseUrl}/predict`,
        { transactions: history },
        { timeout },
      ),
    );

    return (response as any).data as PredictionResult;
  }

  // ─── Statistical fallback (simple moving average) ─────────────────────────

  private statisticalFallback(
    history: { date: string; type: string; amount: string; category: string }[],
  ): PredictionResult {
    // Group by month
    const monthlyTotals: Record<string, { income: number; expense: number }> = {};

    for (const tx of history) {
      const month = tx.date.slice(0, 7);
      if (!monthlyTotals[month]) monthlyTotals[month] = { income: 0, expense: 0 };
      if (tx.type === TransactionType.INCOME)
        monthlyTotals[month].income += parseFloat(tx.amount);
      else
        monthlyTotals[month].expense += parseFloat(tx.amount);
    }

    const months = Object.values(monthlyTotals);
    const n = months.length || 1;

    const avgIncome  = months.reduce((s, m) => s + m.income, 0) / n;
    const avgExpense = months.reduce((s, m) => s + m.expense, 0) / n;

    // Simple linear trend
    const expenseArr = months.map((m) => m.expense);
    const trend = expenseArr.length >= 2
      ? (expenseArr[expenseArr.length - 1] - expenseArr[0]) / expenseArr.length
      : 0;

    const projectedExpense = Math.max(0, avgExpense + trend);
    const projectedIncome  = avgIncome;
    const projectedSavings = projectedIncome - projectedExpense;

    // Category breakdown from most recent month
    const recentMonth = Object.keys(monthlyTotals).sort().pop() || '';
    const categoryBreakdown = this.getCategoryBreakdown(history, recentMonth);

    return {
      projectedExpense:   Math.round(projectedExpense),
      projectedIncome:    Math.round(projectedIncome),
      projectedSavings:   Math.round(projectedSavings),
      confidenceScore:    0.65,
      method:             'statistical_fallback',
      budgetWarning:      projectedExpense > projectedIncome,
      categoryForecasts:  categoryBreakdown,
      nextMonthLabel:     this.nextMonthLabel(),
    };
  }

  private getCategoryBreakdown(
    history: { date: string; type: string; amount: string; category: string }[],
    month: string,
  ) {
    const breakdown: Record<string, number> = {};
    for (const tx of history) {
      if (tx.date.slice(0, 7) !== month) continue;
      if (tx.type !== TransactionType.EXPENSE) continue;
      const cat = tx.category || 'Other';
      breakdown[cat] = (breakdown[cat] || 0) + parseFloat(tx.amount);
    }
    return Object.entries(breakdown)
      .map(([category, amount]) => ({ category, projectedAmount: Math.round(amount) }))
      .sort((a, b) => b.projectedAmount - a.projectedAmount);
  }

  private nextMonthLabel(): string {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
  }
}

interface PredictionResult {
  projectedExpense:  number;
  projectedIncome:   number;
  projectedSavings:  number;
  confidenceScore:   number;
  method:            string;
  budgetWarning:     boolean;
  categoryForecasts: { category: string; projectedAmount: number }[];
  nextMonthLabel:    string;
}

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Insight, InsightType, InsightSeverity } from './insight.entity';
import { Transaction, TransactionType } from '../transactions/transaction.entity';
import { Budget } from '../budgets/budget.entity';

interface GeneratedInsight {
  type: InsightType;
  severity: InsightSeverity;
  message: string;
  impact: string;
  actionable: boolean;
  data?: Record<string, unknown>;
}

@Injectable()
export class InsightsService {
  private readonly logger = new Logger(InsightsService.name);

  constructor(
    @InjectRepository(Insight)
    private readonly insightRepo: Repository<Insight>,
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
    @InjectRepository(Budget)
    private readonly budgetRepo: Repository<Budget>,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  // ─── Get insights for a user ──────────────────────────────────────────────

  async getInsights(userId: string): Promise<Insight[]> {
    const cacheKey = `insights:${userId}`;
    const cached = await this.cache.get<Insight[]>(cacheKey);
    if (cached) return cached;

    const insights = await this.insightRepo.find({
      where: { userId, dismissedAt: null as unknown as Date },
      order: { createdAt: 'DESC' },
      take: 20,
    });

    await this.cache.set(cacheKey, insights, 300);
    return insights;
  }

  async markRead(userId: string, id: string) {
    await this.insightRepo.update({ id, userId }, { isRead: true });
    await this.cache.del(`insights:${userId}`);
  }

  async dismiss(userId: string, id: string) {
    await this.insightRepo.update(
      { id, userId },
      { dismissedAt: new Date() },
    );
    await this.cache.del(`insights:${userId}`);
  }

  // ─── GENERATE (called by BullMQ worker) ──────────────────────────────────

  async generateInsights(userId: string): Promise<void> {
    this.logger.log(`Generating insights for user ${userId}`);

    const [spendingInsights, wasteInsights, savingInsights, budgetInsights] =
      await Promise.all([
        this.analyzeSpendingPatterns(userId),
        this.detectWaste(userId),
        this.generateSavingTips(userId),
        this.checkBudgetAlerts(userId),
      ]);

    const all = [
      ...spendingInsights,
      ...wasteInsights,
      ...savingInsights,
      ...budgetInsights,
    ];

    // Deduplicate: remove similar messages from last 7 days
    const recentMessages = await this.insightRepo
      .createQueryBuilder('i')
      .select('i.message')
      .where('i.userId = :userId', { userId })
      .andWhere('i.createdAt > :since', { since: new Date(Date.now() - 7 * 86400000) })
      .getMany();

    const recentSet = new Set(recentMessages.map((i) => i.message));

    const fresh = all.filter((i) => !recentSet.has(i.message));
    if (fresh.length === 0) return;

    const entities = fresh.map((i) =>
      this.insightRepo.create({ userId, ...i }),
    );
    await this.insightRepo.save(entities);
    await this.cache.del(`insights:${userId}`);

    this.logger.log(`Saved ${entities.length} new insights for ${userId}`);
  }

  // ─── Spending Pattern Analysis ────────────────────────────────────────────

  private async analyzeSpendingPatterns(userId: string): Promise<GeneratedInsight[]> {
    const insights: GeneratedInsight[] = [];

    const now   = new Date();
    const curStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Category spend: current vs previous month
    const [curRows, prevRows] = await Promise.all([
      this.getCategorySpend(userId, curStart, now),
      this.getCategorySpend(userId, prevStart, prevEnd),
    ]);

    const prevMap = new Map(prevRows.map((r) => [r.category, r.total]));

    for (const cur of curRows) {
      const prev = prevMap.get(cur.category) || 0;
      if (prev === 0) continue;

      const changePct = ((cur.total - prev) / prev) * 100;

      if (changePct >= 25) {
        insights.push({
          type:      InsightType.SPENDING_PATTERN,
          severity:  changePct >= 50 ? InsightSeverity.ALERT : InsightSeverity.WARNING,
          message:   `You spent ${Math.round(changePct)}% more on ${cur.category} this month`,
          impact:    changePct >= 50 ? 'high' : 'medium',
          actionable: true,
          data: {
            category: cur.category, currentSpend: cur.total,
            previousSpend: prev, changePct: Math.round(changePct),
          },
        });
      } else if (changePct <= -20) {
        insights.push({
          type:      InsightType.SPENDING_PATTERN,
          severity:  InsightSeverity.SUCCESS,
          message:   `Great job! You spent ${Math.round(Math.abs(changePct))}% less on ${cur.category}`,
          impact:    'low',
          actionable: false,
          data: { category: cur.category, changePct: Math.round(changePct) },
        });
      }
    }

    // Weekend spike detection
    const weekendRows = await this.txRepo
      .createQueryBuilder('tx')
      .select('EXTRACT(DOW FROM tx.date)', 'dow')
      .addSelect('SUM(tx.amount)', 'total')
      .where('tx.userId = :userId', { userId })
      .andWhere('tx.type = :type', { type: TransactionType.EXPENSE })
      .andWhere('tx.date > :since', { since: new Date(Date.now() - 30 * 86400000) })
      .groupBy('dow')
      .getRawMany<{ dow: string; total: string }>();

    const weekdayAvg =
      weekendRows
        .filter((r) => ![0, 6].includes(parseInt(r.dow)))
        .reduce((s, r) => s + parseFloat(r.total), 0) / 5;

    const weekendAvg =
      weekendRows
        .filter((r) => [0, 6].includes(parseInt(r.dow)))
        .reduce((s, r) => s + parseFloat(r.total), 0) / 2;

    if (weekendAvg > weekdayAvg * 1.8) {
      insights.push({
        type:      InsightType.SPENDING_PATTERN,
        severity:  InsightSeverity.WARNING,
        message:   `Your weekend spending is ${Math.round((weekendAvg / weekdayAvg - 1) * 100)}% higher than weekdays`,
        impact:    'medium',
        actionable: true,
        data: { weekdayAvg: Math.round(weekdayAvg), weekendAvg: Math.round(weekendAvg) },
      });
    }

    return insights;
  }

  // ─── Waste Detection ──────────────────────────────────────────────────────

  private async detectWaste(userId: string): Promise<GeneratedInsight[]> {
    const insights: GeneratedInsight[] = [];

    // Detect recurring small expenses (potential subscriptions)
    const recurring = await this.txRepo
      .createQueryBuilder('tx')
      .select('tx.merchant', 'merchant')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(tx.amount)', 'avgAmount')
      .addSelect('SUM(tx.amount)', 'total')
      .where('tx.userId = :userId', { userId })
      .andWhere('tx.type = :type', { type: TransactionType.EXPENSE })
      .andWhere('tx.date > :since', { since: new Date(Date.now() - 90 * 86400000) })
      .andWhere('tx.merchant IS NOT NULL')
      .groupBy('tx.merchant')
      .having('COUNT(*) >= 3')
      .getRawMany<{ merchant: string; count: string; avgAmount: string; total: string }>();

    for (const r of recurring) {
      if (parseFloat(r.avgAmount) < 1000 && parseFloat(r.total) > 500) {
        insights.push({
          type:      InsightType.WASTE_DETECTION,
          severity:  InsightSeverity.INFO,
          message:   `Possible subscription detected: ${r.merchant} (₹${Math.round(parseFloat(r.avgAmount))}/time × ${r.count} times)`,
          impact:    'medium',
          actionable: true,
          data: {
            merchant: r.merchant,
            count: parseInt(r.count),
            avgAmount: parseFloat(r.avgAmount),
            total: parseFloat(r.total),
          },
        });
      }
    }

    // Detect duplicate charges (same amount + merchant within 24h)
    const duplicates = await this.txRepo
      .createQueryBuilder('tx')
      .select('tx.merchant', 'merchant')
      .addSelect('tx.amount', 'amount')
      .addSelect('DATE(tx.date)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('tx.userId = :userId', { userId })
      .andWhere('tx.type = :type', { type: TransactionType.EXPENSE })
      .andWhere('tx.date > :since', { since: new Date(Date.now() - 30 * 86400000) })
      .groupBy('tx.merchant, tx.amount, DATE(tx.date)')
      .having('COUNT(*) > 1')
      .getRawMany<{ merchant: string; amount: string; date: string; count: string }>();

    for (const d of duplicates) {
      insights.push({
        type:      InsightType.WASTE_DETECTION,
        severity:  InsightSeverity.ALERT,
        message:   `Possible duplicate charge: ₹${d.amount} at ${d.merchant} on ${d.date}`,
        impact:    'high',
        actionable: true,
        data: { merchant: d.merchant, amount: d.amount, date: d.date },
      });
    }

    return insights;
  }

  // ─── Saving Tips ──────────────────────────────────────────────────────────

  private async generateSavingTips(userId: string): Promise<GeneratedInsight[]> {
    const insights: GeneratedInsight[] = [];

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalIncome = await this.getTotalByType(userId, TransactionType.INCOME, start, now);
    const totalExpense = await this.getTotalByType(userId, TransactionType.EXPENSE, start, now);

    if (totalIncome === 0) return insights;

    const savingsRate = ((totalIncome - totalExpense) / totalIncome) * 100;

    if (savingsRate < 10) {
      const potential = totalIncome * 0.2 - (totalIncome - totalExpense);
      insights.push({
        type:      InsightType.SAVING_TIP,
        severity:  InsightSeverity.WARNING,
        message:   `Your savings rate is ${Math.round(savingsRate)}% — you can save ₹${Math.round(potential)}/month more`,
        impact:    'high',
        actionable: true,
        data: { savingsRate: Math.round(savingsRate), potentialSaving: Math.round(potential) },
      });
    } else if (savingsRate >= 30) {
      insights.push({
        type:      InsightType.SAVING_TIP,
        severity:  InsightSeverity.SUCCESS,
        message:   `Excellent! You're saving ${Math.round(savingsRate)}% of your income this month`,
        impact:    'low',
        actionable: false,
        data: { savingsRate: Math.round(savingsRate) },
      });
    }

    return insights;
  }

  // ─── Budget Alerts ────────────────────────────────────────────────────────

  private async checkBudgetAlerts(userId: string): Promise<GeneratedInsight[]> {
    const insights: GeneratedInsight[] = [];
    const now  = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const budgets = await this.budgetRepo.find({
      where: { userId, month },
      relations: ['category'],
    });

    for (const budget of budgets) {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const spent = await this.txRepo
        .createQueryBuilder('tx')
        .select('COALESCE(SUM(tx.amount), 0)', 'total')
        .where('tx.userId = :userId', { userId })
        .andWhere('tx.categoryId = :catId', { catId: budget.categoryId })
        .andWhere('tx.type = :type', { type: TransactionType.EXPENSE })
        .andWhere('tx.date BETWEEN :start AND :end', { start, end: now })
        .getRawOne<{ total: string }>();

      const spentAmount  = parseFloat(spent?.total ?? '0');
      const pct = (spentAmount / Number(budget.limit)) * 100;

      if (pct >= 100) {
        insights.push({
          type:      InsightType.BUDGET_WARNING,
          severity:  InsightSeverity.ALERT,
          message:   `You've exceeded your ${budget.category.name} budget by ₹${Math.round(spentAmount - Number(budget.limit))}`,
          impact:    'high',
          actionable: true,
          data: { category: budget.category.name, spent: spentAmount, limit: budget.limit, pct: Math.round(pct) },
        });
      } else if (pct >= (budget.alertAtPercent || 80)) {
        insights.push({
          type:      InsightType.BUDGET_WARNING,
          severity:  InsightSeverity.WARNING,
          message:   `${budget.category.name} budget ${Math.round(pct)}% used — ₹${Math.round(Number(budget.limit) - spentAmount)} remaining`,
          impact:    'medium',
          actionable: true,
          data: { category: budget.category.name, spent: spentAmount, limit: budget.limit, pct: Math.round(pct) },
        });
      }
    }

    return insights;
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async getCategorySpend(userId: string, start: Date, end: Date) {
    return this.txRepo
      .createQueryBuilder('tx')
      .select('cat.name', 'category')
      .addSelect('SUM(tx.amount)', 'total')
      .leftJoin('tx.category', 'cat')
      .where('tx.userId = :userId', { userId })
      .andWhere('tx.type = :type', { type: TransactionType.EXPENSE })
      .andWhere('tx.date BETWEEN :start AND :end', { start, end })
      .groupBy('cat.name')
      .getRawMany<{ category: string; total: number }>();
  }

  private async getTotalByType(
    userId: string, type: TransactionType, start: Date, end: Date,
  ): Promise<number> {
    const r = await this.txRepo
      .createQueryBuilder('tx')
      .select('COALESCE(SUM(tx.amount), 0)', 'total')
      .where('tx.userId = :userId', { userId })
      .andWhere('tx.type = :type', { type })
      .andWhere('tx.date BETWEEN :start AND :end', { start, end })
      .getRawOne<{ total: string }>();
    return parseFloat(r?.total ?? '0');
  }
}

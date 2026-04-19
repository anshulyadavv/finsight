import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Insight, InsightType, InsightSeverity } from './insight.entity';
import { Transaction, TransactionType } from '../transactions/transaction.entity';
import { Budget } from '../budgets/budget.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';

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
    @InjectRepository(Insight) private readonly insightRepo: Repository<Insight>,
    @InjectRepository(Transaction) private readonly txRepo: Repository<Transaction>,
    @InjectRepository(Budget) private readonly budgetRepo: Repository<Budget>,
    @Inject(CACHE_MANAGER) private cache: Cache,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getInsights(userId: string): Promise<Insight[]> {
    const cacheKey = `insights:${userId}`;
    const cached = await this.cache.get<Insight[]>(cacheKey);
    if (cached) return cached;

    const insights = await this.insightRepo.find({
      where: { userId, dismissedAt: null as any },
      order: { createdAt: 'DESC' },
      take: 20,
    });

    await this.cache.set(cacheKey, insights, (300 * 1000) as any);
    return insights;
  }

  async markRead(userId: string, id: string) {
    await this.insightRepo.update({ id, userId }, { isRead: true });
    await this.cache.del(`insights:${userId}`);
  }

  async dismiss(userId: string, id: string) {
    await this.insightRepo.update({ id, userId }, { dismissedAt: new Date() });
    await this.cache.del(`insights:${userId}`);
  }

  /**
   * Purge legacy broken insights (Infinity%, absurd savings % messages, old-format strings).
   * Called automatically before every generation run and exposed as an admin endpoint.
   */
  async purgeStaleInsights(userId: string): Promise<{ deleted: number }> {
    const STALE_PATTERNS = [
      '%Infinity%',
      '%higher than weekdays%',
      '%higher than weekday%',
      '%saving % of your income%',
      '%Excellent! You\'re saving%',
      '% more on % this month',        // old format: "You spent X% more on Y this month"
      '%Budget Exceeded:%',            // old format without ₹ formatting
      '%savings rate is %%. Aim%',     // old format without "threshold" wording
    ];

    let deleted = 0;
    for (const pattern of STALE_PATTERNS) {
      const result = await this.insightRepo
        .createQueryBuilder()
        .delete()
        .where('user_id = :userId', { userId })
        .andWhere('message LIKE :pattern', { pattern })
        .execute();
      deleted += result.affected ?? 0;
    }

    if (deleted > 0) {
      this.logger.log(`Purged ${deleted} stale insights for user ${userId}`);
      await this.cache.del(`insights:${userId}`);
    }
    return { deleted };
  }
  async generateInsights(userId: string): Promise<void> {
    this.logger.log(`Generating insights for user ${userId}`);

    // Auto-purge any legacy broken insights before generating fresh ones
    await this.purgeStaleInsights(userId);

    const [spending, waste, savings, budgets, weekend, subscriptions] = await Promise.all([
      this.analyzeSpendingPatterns(userId),
      this.detectWaste(userId),
      this.generateSavingTips(userId),
      this.checkBudgetAlerts(userId),
      this.analyzeWeekendSpending(userId),
      this.detectRecurringCharges(userId),
    ]);

    const all = [...spending, ...waste, ...savings, ...budgets, ...weekend, ...subscriptions];
    
    // Deduplicate against insights generated in the last 7 days
    const recent = await this.insightRepo.find({
      where: { userId, createdAt: { $gt: new Date(Date.now() - 7 * 86400000) } as any },
      select: ['message'],
    });
    const recentSet = new Set(recent.map(r => r.message));
    const fresh = all.filter(i => !recentSet.has(i.message));

    if (fresh.length === 0) return;

    for (const data of fresh) {
      const insight = this.insightRepo.create({ ...data, userId });
      await this.insightRepo.save(insight);
      
      // Persist as notification for UI bell
      const user = { id: userId } as any; 
      await this.notificationsService.create(user, {
        title: '💡 New Insight',
        message: insight.message,
        type: NotificationType.INSIGHT,
        metadata: { insightId: insight.id }
      });
    }
    
    await this.cache.del(`insights:${userId}`);
  }

  // ── Spending Patterns (month-over-month by category) ────────────────────────

  private async analyzeSpendingPatterns(userId: string): Promise<GeneratedInsight[]> {
    const insights: GeneratedInsight[] = [];
    const now = new Date();
    const curStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [curRows, prevRows] = await Promise.all([
      this.getCategorySpend(userId, curStart, now),
      this.getCategorySpend(userId, prevStart, prevEnd),
    ]);

    const prevMap = new Map(prevRows.map(r => [r.category, r.total]));

    for (const cur of curRows) {
      const prev = prevMap.get(cur.category) || 0;
      // Skip if no previous data — can't compute a meaningful change
      if (prev === 0) continue;

      const changePct = ((cur.total - prev) / prev) * 100;
      if (changePct < 25) continue;

      // Cap the displayed percentage — anything above 200% is "dramatically higher"
      const displayPct = Math.round(Math.min(changePct, 200));
      const isExtreme = changePct > 200;

      const message = isExtreme
        ? `Your ${cur.category} spending has increased dramatically compared to last month`
        : `Your ${cur.category} spending is up ${displayPct}% compared to last month`;

      const suggestion = changePct >= 100
        ? `Review your recent ${cur.category} transactions — this is more than double last month's spending. Consider whether these were one-time expenses or a new pattern.`
        : `Your ${cur.category} spending rose noticeably. Check for any unplanned purchases and consider setting a category budget.`;

      insights.push({
        type: InsightType.SPENDING_PATTERN,
        severity: changePct >= 75 ? InsightSeverity.ALERT : InsightSeverity.WARNING,
        message,
        impact: changePct >= 75 ? 'high' : 'medium',
        actionable: true,
        data: {
          category: cur.category,
          currentSpend: cur.total,
          previousSpend: prev,
          changePct: displayPct,
          suggestion,
        },
      });
    }
    return insights;
  }

  // ── Weekend vs Weekday Spending ─────────────────────────────────────────────

  private async analyzeWeekendSpending(userId: string): Promise<GeneratedInsight[]> {
    const insights: GeneratedInsight[] = [];
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Query spending grouped by whether the day is a weekend (Sat=6, Sun=0)
    const rows = await this.txRepo
      .createQueryBuilder('tx')
      .select(
        `CASE WHEN EXTRACT(DOW FROM tx.date) IN (0, 6) THEN 'weekend' ELSE 'weekday' END`,
        'dayType',
      )
      .addSelect('SUM(CAST(tx.amount AS NUMERIC))', 'total')
      .addSelect('COUNT(DISTINCT DATE(tx.date))', 'dayCount')
      .where('tx.userId = :userId', { userId })
      .andWhere('tx.type = :type', { type: TransactionType.EXPENSE })
      .andWhere('tx.date BETWEEN :start AND :end', { start: monthStart, end: now })
      .groupBy(
        `CASE WHEN EXTRACT(DOW FROM tx.date) IN (0, 6) THEN 'weekend' ELSE 'weekday' END`,
      )
      .getRawMany() as { dayType: string; total: string; dayCount: string }[];

    const map: Record<string, { total: number; days: number }> = {};
    for (const r of rows) {
      map[r.dayType] = { total: parseFloat(r.total), days: parseInt(r.dayCount, 10) || 1 };
    }

    const weekend = map['weekend'];
    const weekday = map['weekday'];

    // Only generate insight when BOTH weekend and weekday data exist
    if (!weekend || !weekday || weekday.total <= 0 || weekend.total <= 0) {
      return insights;
    }

    // Normalize to per-day average for a fair comparison
    const weekendPerDay = weekend.total / weekend.days;
    const weekdayPerDay = weekday.total / weekday.days;

    // Guard: weekday per-day is too small to compare meaningfully (< ₹10)
    if (weekdayPerDay < 10) return insights;

    const diffPct = ((weekendPerDay - weekdayPerDay) / weekdayPerDay) * 100;

    // Only flag if weekend per-day spending is at least 30% higher
    if (diffPct < 30) return insights;

    // Cap display at 200% — anything higher is just "significantly"
    const displayPct = Math.round(Math.min(diffPct, 200));
    const isExtreme = diffPct > 200;

    const message = isExtreme
      ? `Your weekend spending per day is significantly higher than weekdays this month`
      : `Your weekend spending is ${displayPct}% higher per day compared to weekdays`;

    const suggestion = diffPct > 100
      ? 'Your weekends account for a large share of expenses. Consider pre-planning weekend activities or setting a weekly entertainment budget.'
      : 'Weekend spending tends to add up. Try tracking leisure expenses separately to stay aware of the pattern.';

    insights.push({
      type: InsightType.SPENDING_PATTERN,
      severity: diffPct >= 100 ? InsightSeverity.ALERT : InsightSeverity.WARNING,
      message,
      impact: diffPct >= 100 ? 'high' : 'medium',
      actionable: true,
      data: {
        weekendTotal: weekend.total,
        weekdayTotal: weekday.total,
        weekendPerDay: Math.round(weekendPerDay),
        weekdayPerDay: Math.round(weekdayPerDay),
        changePct: displayPct,
        suggestion,
      },
    });

    return insights;
  }

  // ── Duplicate / Waste Detection ─────────────────────────────────────────────

  private async detectWaste(userId: string): Promise<GeneratedInsight[]> {
    const insights: GeneratedInsight[] = [];
    const duplicates = await this.txRepo
      .createQueryBuilder('tx')
      .select('tx.merchant', 'merchant')
      .addSelect('tx.amount', 'amount')
      .addSelect('COUNT(*)', 'count')
      .where('tx.userId = :userId', { userId })
      .andWhere('tx.type = :type', { type: TransactionType.EXPENSE })
      .andWhere('tx.date > :since', { since: new Date(Date.now() - 30 * 86400000) })
      .groupBy('tx.merchant, tx.amount, DATE(tx.date)')
      .having('COUNT(*) > 1')
      .getRawMany();

    for (const d of duplicates) {
      insights.push({
        type: InsightType.WASTE_DETECTION,
        severity: InsightSeverity.ALERT,
        message: `Possible duplicate charge: ₹${d.amount} at ${d.merchant}`,
        impact: 'high',
        actionable: true,
        data: {
          merchant: d.merchant,
          amount: d.amount,
          suggestion: `You were charged ₹${d.amount} at ${d.merchant} multiple times on the same day. Verify with your bank if this was intentional.`,
        },
      });
    }
    return insights;
  }

  // ── Recurring Subscription Detection ────────────────────────────────────────

  private async detectRecurringCharges(userId: string): Promise<GeneratedInsight[]> {
    const insights: GeneratedInsight[] = [];

    // Find merchants with small, repeating charges across multiple months
    const recurring = await this.txRepo
      .createQueryBuilder('tx')
      .select('tx.merchant', 'merchant')
      .addSelect('ROUND(AVG(CAST(tx.amount AS NUMERIC)), 2)', 'avgAmount')
      .addSelect('COUNT(*)', 'count')
      .addSelect('COUNT(DISTINCT TO_CHAR(tx.date, \'YYYY-MM\'))', 'months')
      .where('tx.userId = :userId', { userId })
      .andWhere('tx.type = :type', { type: TransactionType.EXPENSE })
      .andWhere('tx.date > :since', { since: new Date(Date.now() - 90 * 86400000) })
      .groupBy('tx.merchant')
      .having('COUNT(DISTINCT TO_CHAR(tx.date, \'YYYY-MM\')) >= 2')
      .andHaving('COUNT(*) >= 2')
      .andHaving('AVG(CAST(tx.amount AS NUMERIC)) < 2000')
      .andHaving('STDDEV(CAST(tx.amount AS NUMERIC)) / NULLIF(AVG(CAST(tx.amount AS NUMERIC)), 0) < 0.15')
      .getRawMany() as { merchant: string; avgAmount: string; count: string; months: string }[];

    for (const r of recurring) {
      if (!r.merchant) continue;
      const avg = parseFloat(r.avgAmount);

      insights.push({
        type: InsightType.OPTIMIZATION,
        severity: InsightSeverity.INFO,
        message: `Recurring charge detected: ~₹${Math.round(avg)}/month at ${r.merchant}`,
        impact: 'low',
        actionable: true,
        data: {
          merchant: r.merchant,
          avgAmount: avg,
          months: parseInt(r.months, 10),
          suggestion: `You've been charged ~₹${Math.round(avg)} at ${r.merchant} for ${r.months} consecutive months. If this is a subscription you no longer use, cancelling could save you ₹${Math.round(avg * 12)}/year.`,
        },
      });
    }

    return insights;
  }

  // ── Savings Tips (tiered feedback) ──────────────────────────────────────────

  private async generateSavingTips(userId: string): Promise<GeneratedInsight[]> {
    const insights: GeneratedInsight[] = [];
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const income = await this.getTotalByType(userId, TransactionType.INCOME, start, now);
    const expense = await this.getTotalByType(userId, TransactionType.EXPENSE, start, now);

    // Need income to compute a savings rate
    if (income === 0) return insights;

    const rate = ((income - expense) / income) * 100;
    const roundedRate = Math.round(rate);

    if (rate < 0) {
      // Spending more than earning
      insights.push({
        type: InsightType.SAVING_TIP,
        severity: InsightSeverity.ALERT,
        message: `You're spending more than you earn this month — expenses exceed income by ₹${Math.round(expense - income).toLocaleString('en-IN')}`,
        impact: 'high',
        actionable: true,
        data: {
          savingsRate: roundedRate,
          income,
          expense,
          suggestion: 'Review your discretionary spending immediately. Focus on cutting non-essential categories and avoid new commitments until you\'re back in the green.',
        },
      });
    } else if (rate < 10) {
      insights.push({
        type: InsightType.SAVING_TIP,
        severity: InsightSeverity.WARNING,
        message: `Your savings rate is ${roundedRate}% this month — below the recommended 20% threshold`,
        impact: 'high',
        actionable: true,
        data: {
          savingsRate: roundedRate,
          income,
          expense,
          suggestion: 'Try the 50/30/20 rule: allocate 50% of income to needs, 30% to wants, and 20% to savings. Even small increases in savings make a big difference over time.',
        },
      });
    } else if (rate >= 10 && rate < 20) {
      insights.push({
        type: InsightType.SAVING_TIP,
        severity: InsightSeverity.INFO,
        message: `You're saving ${roundedRate}% of your income — good start, but there's room to grow`,
        impact: 'medium',
        actionable: true,
        data: {
          savingsRate: roundedRate,
          income,
          expense,
          suggestion: 'You\'re on the right track! Consider automating a fixed monthly transfer to a savings account to gradually push your rate above 20%.',
        },
      });
    } else if (rate >= 20 && rate < 50) {
      insights.push({
        type: InsightType.SAVING_TIP,
        severity: InsightSeverity.SUCCESS,
        message: `Strong savings rate of ${roundedRate}% this month — you're building real financial resilience`,
        impact: 'low',
        actionable: true,
        data: {
          savingsRate: roundedRate,
          income,
          expense,
          suggestion: 'Great discipline! Consider investing your surplus in a recurring SIP or building a 6-month emergency fund if you haven\'t already.',
        },
      });
    } else {
      // rate >= 50%
      insights.push({
        type: InsightType.SAVING_TIP,
        severity: InsightSeverity.SUCCESS,
        message: `Exceptional savings rate of ${roundedRate}% — you're retaining over half your income this month`,
        impact: 'low',
        actionable: true,
        data: {
          savingsRate: roundedRate,
          income,
          expense,
          suggestion: 'Outstanding financial discipline. At this rate, you could explore diversified investments, tax-saving instruments like ELSS, or accelerate any loan repayments.',
        },
      });
    }

    return insights;
  }

  // ── Budget Threshold Alerts ─────────────────────────────────────────────────

  private async checkBudgetAlerts(userId: string): Promise<GeneratedInsight[]> {
    const insights: GeneratedInsight[] = [];
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const budgets = await this.budgetRepo.find({ where: { userId, month }, relations: ['category'] });

    for (const budget of budgets) {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const spent = await this.txRepo
        .createQueryBuilder('tx')
        .select('SUM(tx.amount)', 'total')
        .where('tx.userId = :userId AND tx.categoryId = :catId', { userId, catId: budget.categoryId })
        .andWhere('tx.date BETWEEN :start AND :end', { start, end: now })
        .getRawOne();
      
      const amount = parseFloat(spent?.total ?? '0');
      const limit = Number(budget.limit);
      if (limit <= 0) continue;

      const pct = (amount / limit) * 100;

      if (pct >= 100) {
        const overBy = Math.round(amount - limit);
        insights.push({
          type: InsightType.BUDGET_WARNING,
          severity: InsightSeverity.ALERT,
          message: `Budget exceeded in ${budget.category.name} — you've spent ₹${Math.round(amount).toLocaleString('en-IN')} of your ₹${Math.round(limit).toLocaleString('en-IN')} limit`,
          impact: 'high',
          actionable: true,
          data: {
            category: budget.category.name,
            spent: amount,
            limit,
            overBy,
            suggestion: `You've exceeded your ${budget.category.name} budget by ₹${overBy.toLocaleString('en-IN')}. Consider adjusting your budget for next month or reducing discretionary spending in this category.`,
          },
        });
      } else if (pct >= 80) {
        // Near-limit warning
        const remaining = Math.round(limit - amount);
        insights.push({
          type: InsightType.BUDGET_WARNING,
          severity: InsightSeverity.WARNING,
          message: `${budget.category.name} budget is ${Math.round(pct)}% used — ₹${remaining.toLocaleString('en-IN')} remaining`,
          impact: 'medium',
          actionable: true,
          data: {
            category: budget.category.name,
            spent: amount,
            limit,
            usagePct: Math.round(pct),
            suggestion: `You're nearing your ${budget.category.name} budget limit with ₹${remaining.toLocaleString('en-IN')} left. Pace your spending for the rest of the month.`,
          },
        });
      }
    }
    return insights;
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private async getCategorySpend(userId: string, start: Date, end: Date) {
    return this.txRepo
      .createQueryBuilder('tx')
      .select('cat.name', 'category')
      .addSelect('SUM(tx.amount)', 'total')
      .leftJoin('tx.category', 'cat')
      .where('tx.userId = :userId AND tx.type = :type', { userId, type: TransactionType.EXPENSE })
      .andWhere('tx.date BETWEEN :start AND :end', { start, end })
      .groupBy('cat.name')
      .getRawMany();
  }

  private async getTotalByType(userId: string, type: TransactionType, start: Date, end: Date): Promise<number> {
    const r = await this.txRepo
      .createQueryBuilder('tx')
      .select('SUM(tx.amount)', 'total')
      .where('tx.userId = :userId AND tx.type = :type', { userId, type })
      .andWhere('tx.date BETWEEN :start AND :end', { start, end })
      .getRawOne();
    return parseFloat(r?.total ?? '0');
  }
}

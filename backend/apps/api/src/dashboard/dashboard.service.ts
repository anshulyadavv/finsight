import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Transaction, TransactionType } from '../transactions/transaction.entity';
import { Budget } from '../budgets/budget.entity';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);
  private readonly CACHE_TTL = 120; // 2 minutes

  constructor(
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
    @InjectRepository(Budget)
    private readonly budgetRepo: Repository<Budget>,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  // ─── GET /dashboard/summary ───────────────────────────────────────────────

  async getSummary(userId: string, month?: string) {
    const cacheKey = `dashboard:summary:${userId}:${month || 'current'}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const { start, end, monthStr } = this.resolveMonthRange(month);

    const [income, expenses] = await Promise.all([
      this.sumByType(userId, TransactionType.INCOME, start, end),
      this.sumByType(userId, TransactionType.EXPENSE, start, end),
    ]);

    // Previous month for trend
    const prevStart = new Date(start);
    prevStart.setMonth(prevStart.getMonth() - 1);
    const prevEnd = new Date(end);
    prevEnd.setMonth(prevEnd.getMonth() - 1);

    const [prevIncome, prevExpenses] = await Promise.all([
      this.sumByType(userId, TransactionType.INCOME, prevStart, prevEnd),
      this.sumByType(userId, TransactionType.EXPENSE, prevStart, prevEnd),
    ]);

    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    const result = {
      month: monthStr,
      totalBalance:    savings,
      monthlyIncome:   income,
      monthlyExpenses: expenses,
      savings,
      savingsRate:     parseFloat(savingsRate.toFixed(1)),
      trends: {
        income:   this.calcTrend(prevIncome, income),
        expenses: this.calcTrend(prevExpenses, expenses),
        savings:  this.calcTrend(prevIncome - prevExpenses, savings),
      },
    };

    await this.cache.set(cacheKey, result, this.CACHE_TTL);
    return result;
  }

  // ─── GET /dashboard/overview ──────────────────────────────────────────────

  async getOverview(userId: string, month?: string) {
    const cacheKey = `dashboard:overview:${userId}:${month || 'current'}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const { start, end } = this.resolveMonthRange(month);

    const rows = await this.txRepo
      .createQueryBuilder('tx')
      .select('cat.name',  'category')
      .addSelect('cat.icon',  'icon')
      .addSelect('cat.color', 'color')
      .addSelect('SUM(tx.amount)', 'total')
      .leftJoin('tx.category', 'cat')
      .where('tx.userId = :userId', { userId })
      .andWhere('tx.type = :type', { type: TransactionType.EXPENSE })
      .andWhere('tx.date BETWEEN :start AND :end', { start, end })
      .groupBy('cat.name, cat.icon, cat.color')
      .orderBy('total', 'DESC')
      .getRawMany() as { category: string; icon: string; color: string; total: string }[];

    const totalSpend = rows.reduce((s, r) => s + parseFloat(r.total), 0);

    const categories = rows.map((r) => ({
      name:       r.category || 'Uncategorized',
      icon:       r.icon,
      color:      r.color,
      amount:     parseFloat(r.total),
      percentage: totalSpend > 0 ? parseFloat(((parseFloat(r.total) / totalSpend) * 100).toFixed(1)) : 0,
    }));

    const budgets = await this.budgetRepo.find({
      where: { userId, month: this.formatMonth(start) },
      relations: ['category'],
    });

    const totalBudgeted = budgets.reduce((s, b) => s + Number(b.limit), 0);

    const result = {
      totalSpend,
      totalBudgeted,
      remaining: totalBudgeted - totalSpend,
      categories,
      budgetUtilization:
        totalBudgeted > 0
          ? parseFloat(((totalSpend / totalBudgeted) * 100).toFixed(1))
          : null,
    };

    await this.cache.set(cacheKey, result, this.CACHE_TTL);
    return result;
  }

  // ─── GET /dashboard/money-flow ────────────────────────────────────────────

  async getMoneyFlow(userId: string, months = 6) {
    const cacheKey = `dashboard:flow:${userId}:${months}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const end   = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - months + 1);
    start.setDate(1);

    const rows = await this.txRepo
      .createQueryBuilder('tx')
      .select("TO_CHAR(tx.date, 'YYYY-MM')", 'month')
      .addSelect('tx.type', 'type')
      .addSelect('SUM(tx.amount)', 'total')
      .where('tx.userId = :userId', { userId })
      .andWhere('tx.date BETWEEN :start AND :end', { start, end })
      .andWhere('tx.type IN (:...types)', { types: [TransactionType.INCOME, TransactionType.EXPENSE] })
      .groupBy("TO_CHAR(tx.date, 'YYYY-MM'), tx.type")
      .orderBy("TO_CHAR(tx.date, 'YYYY-MM')", 'ASC')
      .getRawMany() as { month: string; type: string; total: string }[];

    // Build month-indexed map
    const monthMap: Record<string, { income: number; expenses: number }> = {};
    for (let i = 0; i < months; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (months - 1 - i));
      const key = this.formatMonth(d);
      monthMap[key] = { income: 0, expenses: 0 };
    }

    rows.forEach((r) => {
      if (!monthMap[r.month]) return;
      if (r.type === TransactionType.INCOME)
        monthMap[r.month].income = parseFloat(r.total);
      else
        monthMap[r.month].expenses = parseFloat(r.total);
    });

    const series = Object.entries(monthMap).map(([month, vals]) => ({
      month,
      label: new Date(month + '-01').toLocaleString('en-IN', { month: 'short', year: '2-digit' }),
      income:   vals.income,
      expenses: vals.expenses,
      net:      vals.income - vals.expenses,
    }));

    await this.cache.set(cacheKey, series, this.CACHE_TTL);
    return series;
  }

  // ─── GET /dashboard/wealth ────────────────────────────────────────────────

  async getWealth(userId: string) {
    const cacheKey = `dashboard:wealth:${userId}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    // Aggregate net by payment method as a proxy for account type
    const rows = await this.txRepo
      .createQueryBuilder('tx')
      .select('tx.paymentMethod', 'method')
      .addSelect(
        `SUM(CASE WHEN tx.type = 'income' THEN tx.amount ELSE -tx.amount END)`,
        'balance',
      )
      .where('tx.userId = :userId', { userId })
      .groupBy('tx.paymentMethod')
      .getRawMany() as { method: string; balance: string }[];

    const accounts = rows.map((r) => ({
      name:    this.methodLabel(r.method),
      type:    r.method,
      balance: parseFloat(r.balance),
    })).filter((a) => a.balance !== 0);

    const total = accounts.reduce((s, a) => s + a.balance, 0);

    const result = { totalWealth: total, accounts };
    await this.cache.set(cacheKey, result, this.CACHE_TTL);
    return result;
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private async sumByType(
    userId: string,
    type: TransactionType,
    start: Date,
    end: Date,
  ): Promise<number> {
    const row = await this.txRepo
      .createQueryBuilder('tx')
      .select('COALESCE(SUM(tx.amount), 0)', 'total')
      .where('tx.userId = :userId', { userId })
      .andWhere('tx.type = :type', { type })
      .andWhere('tx.date BETWEEN :start AND :end', { start, end })
      .getRawOne<{ total: string }>();
    return parseFloat(row?.total ?? '0');
  }

  private resolveMonthRange(month?: string) {
    let start: Date, end: Date;
    if (month) {
      const [y, m] = month.split('-').map(Number);
      start = new Date(y, m - 1, 1);
      end   = new Date(y, m, 0, 23, 59, 59);
    } else {
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }
    return { start, end, monthStr: this.formatMonth(start) };
  }

  private formatMonth(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  private calcTrend(prev: number, curr: number): { value: number; direction: string } {
    if (prev === 0) return { value: 0, direction: 'neutral' };
    const pct = ((curr - prev) / prev) * 100;
    return {
      value: parseFloat(Math.abs(pct).toFixed(1)),
      direction: pct > 0 ? 'up' : pct < 0 ? 'down' : 'neutral',
    };
  }

  private methodLabel(method: string): string {
    const map: Record<string, string> = {
      upi: 'UPI Wallet', card: 'Card Account',
      netbanking: 'Bank Account', cash: 'Cash',
      wallet: 'Digital Wallet', cheque: 'Cheque',
    };
    return map[method] || 'Other';
  }
}

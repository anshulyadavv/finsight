// budgets.service.ts
import {
  Injectable, NotFoundException, ConflictException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from './budget.entity';
import { Transaction, TransactionType } from '../transactions/transaction.entity';

export interface BudgetWithUsage extends Budget {
  spent:     number;
  remaining: number;
  usedPct:   number;
  status:    'ok' | 'warning' | 'exceeded';
}

@Injectable()
export class BudgetsService {
  private readonly logger = new Logger(BudgetsService.name);

  constructor(
    @InjectRepository(Budget) private readonly repo: Repository<Budget>,
    @InjectRepository(Transaction) private readonly txRepo: Repository<Transaction>,
  ) {}

  async findAll(userId: string, month?: string): Promise<BudgetWithUsage[]> {
    const targetMonth = month || this.currentMonth();
    const budgets = await this.repo.find({
      where: { userId, month: targetMonth },
      relations: ['category'],
    });
    return Promise.all(budgets.map((b) => this.enrichWithUsage(b, userId)));
  }

  async create(
    userId: string,
    dto: { categoryId: string; limit: number; month?: string; alertAtPercent?: number },
  ): Promise<Budget> {
    const month = dto.month || this.currentMonth();
    const exists = await this.repo.findOne({
      where: { userId, categoryId: dto.categoryId, month },
    });
    if (exists) throw new ConflictException('Budget for this category/month already exists');

    const budget = this.repo.create({
      userId,
      categoryId: dto.categoryId,
      limit: dto.limit,
      month,
      alertAtPercent: dto.alertAtPercent ?? 80,
    });
    return this.repo.save(budget);
  }

  async update(
    userId: string,
    id: string,
    dto: { limit?: number; alertAtPercent?: number },
  ): Promise<Budget> {
    const budget = await this.repo.findOne({ where: { id, userId } });
    if (!budget) throw new NotFoundException('Budget not found');
    Object.assign(budget, dto);
    return this.repo.save(budget);
  }

  async remove(userId: string, id: string): Promise<void> {
    const budget = await this.repo.findOne({ where: { id, userId } });
    if (!budget) throw new NotFoundException('Budget not found');
    await this.repo.remove(budget);
  }

  // ─── Enrich budget with current spend ────────────────────────────────────

  private async enrichWithUsage(
    budget: Budget,
    userId: string,
  ): Promise<BudgetWithUsage> {
    const [year, mo] = budget.month.split('-').map(Number);
    const start = new Date(year, mo - 1, 1);
    const end   = new Date(year, mo, 0, 23, 59, 59);

    const row = await this.txRepo
      .createQueryBuilder('tx')
      .select('COALESCE(SUM(tx.amount), 0)', 'total')
      .where('tx.userId = :userId', { userId })
      .andWhere('tx.categoryId = :catId', { catId: budget.categoryId })
      .andWhere('tx.type = :type', { type: TransactionType.EXPENSE })
      .andWhere('tx.date BETWEEN :start AND :end', { start, end })
      .getRawOne<{ total: string }>();

    const spent     = parseFloat(row?.total ?? '0');
    const limit     = Number(budget.limit);
    const remaining = limit - spent;
    const usedPct   = limit > 0 ? parseFloat(((spent / limit) * 100).toFixed(1)) : 0;
    const status: 'ok' | 'warning' | 'exceeded' =
      usedPct >= 100 ? 'exceeded'
      : usedPct >= budget.alertAtPercent ? 'warning'
      : 'ok';

    return { ...budget, spent, remaining, usedPct, status };
  }

  private currentMonth(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
}

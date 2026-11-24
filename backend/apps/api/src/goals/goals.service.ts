import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Goal } from './goal.entity';
import { GoalMember, GoalRole } from './goal-member.entity';
import { GoalContribution } from './goal-contribution.entity';
import { CreateGoalDto, UpdateGoalDto, AddContributionDto } from './dto/goal.dto';
import { TransactionsService } from '../transactions/transactions.service';
import { CreateTransactionDto } from '../transactions/dto/transaction.dto';
import { TransactionType, PaymentMethod } from '../transactions/transaction.entity';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal) private readonly goalRepo: Repository<Goal>,
    @InjectRepository(GoalMember) private readonly memberRepo: Repository<GoalMember>,
    @InjectRepository(GoalContribution) private readonly contribRepo: Repository<GoalContribution>,
    @InjectQueue('goals') private readonly goalsQueue: Queue,
    private readonly txService: TransactionsService,
  ) {}

  async createGoal(userId: string, dto: CreateGoalDto): Promise<Goal> {
    const goal = this.goalRepo.create({ ...dto, createdBy: userId });
    await this.goalRepo.save(goal);

    // Add creator as owner
    const member = this.memberRepo.create({
      goalId: goal.id,
      userId,
      role: GoalRole.OWNER,
    });
    await this.memberRepo.save(member);

    // Schedule a reminder logic
    await this.goalsQueue.add('check-reminders', { goalId: goal.id }, { repeat: { cron: '0 9 * * 1' } }); // Every monday

    return goal;
  }

  async getGoals(userId: string): Promise<Goal[]> {
    const memberships = await this.memberRepo.find({ where: { userId }, relations: ['goal', 'goal.members', 'goal.contributions'] });
    return memberships.map(m => m.goal);
  }

  async getGoal(userId: string, id: string): Promise<Goal> {
    const member = await this.memberRepo.findOne({ where: { userId, goalId: id } });
    if (!member) throw new ForbiddenException('You do not have access to this goal');

    const goal = await this.goalRepo.findOne({ where: { id }, relations: ['members', 'members.user', 'contributions', 'contributions.user'] });
    if (!goal) throw new NotFoundException('Goal not found');
    return goal;
  }

  async updateGoal(userId: string, id: string, dto: UpdateGoalDto): Promise<Goal> {
    const owner = await this.memberRepo.findOne({ where: { userId, goalId: id, role: GoalRole.OWNER } });
    if (!owner) throw new ForbiddenException('Only owners can edit goals');
    const goal = await this.goalRepo.findOne({ where: { id } });
    if (!goal) throw new NotFoundException('Goal not found');
    Object.assign(goal, dto);
    return this.goalRepo.save(goal);
  }

  async deleteGoal(userId: string, id: string): Promise<void> {
    const owner = await this.memberRepo.findOne({ where: { userId, goalId: id, role: GoalRole.OWNER } });
    if (!owner) throw new ForbiddenException('Only owners can delete goals');
    await this.contribRepo.delete({ goalId: id });
    await this.memberRepo.delete({ goalId: id });
    await this.goalRepo.delete(id);
  }

  async inviteUserToGoal(ownerId: string, goalId: string, inviteeId: string): Promise<GoalMember> {
    const owner = await this.memberRepo.findOne({ where: { userId: ownerId, goalId, role: GoalRole.OWNER } });
    if (!owner) throw new ForbiddenException('Only owners can invite');

    const exists = await this.memberRepo.findOne({ where: { userId: inviteeId, goalId } });
    if (exists) return exists;

    const newMember = this.memberRepo.create({
      goalId,
      userId: inviteeId,
      role: GoalRole.CONTRIBUTOR,
    });
    return this.memberRepo.save(newMember);
  }

  async addContribution(userId: string, goalId: string, dto: AddContributionDto) {
    const member = await this.memberRepo.findOne({ where: { userId, goalId } });
    if (!member) throw new ForbiddenException('Only members can contribute');

    const goal = await this.goalRepo.findOne({ where: { id: goalId } });
    if (!goal) throw new NotFoundException('Goal not found');

    // Create a physical transaction to back the contribution
    const txObj: CreateTransactionDto = {
      amount: dto.amount,
      type: TransactionType.EXPENSE, // Assuming moving money to a goal is technically locking it, or categorized
      date: dto.date,
      description: `Contribution to goal: ${goal.title}`,
      merchant: `Goal: ${goal.title}`,
      paymentMethod: PaymentMethod.OTHER,
      isRecurring: false,
    };
    const tx = await this.txService.create(userId, txObj);

    // Create contribution
    const contribution = this.contribRepo.create({
      goalId,
      userId,
      amount: dto.amount,
      date: dto.date,
      transactionId: tx.id,
    });
    return this.contribRepo.save(contribution);
  }

  async getGoalProgress(userId: string, id: string) {
    const goal = await this.getGoal(userId, id);
    let totalSaved = 0;
    const userContributions: Record<string, number> = {};

    goal.contributions.forEach(c => {
      const amt = Number(c.amount);
      totalSaved += amt;
      userContributions[c.userId] = (userContributions[c.userId] || 0) + amt;
    });

    const remaining = Math.max(Number(goal.targetAmount) - totalSaved, 0);
    const progressPercentage = (totalSaved / Number(goal.targetAmount)) * 100;

    // Simple forecasting (Assume identical contribution pace)
    const daysSinceStart = (new Date().getTime() - goal.createdAt.getTime()) / (1000 * 3600 * 24);
    let projectedCompletionDate = null;
    if (daysSinceStart > 0 && totalSaved > 0) {
      const ratePerDay = totalSaved / daysSinceStart;
      if (remaining > 0) {
        const daysRemaining = remaining / ratePerDay;
        projectedCompletionDate = new Date(new Date().getTime() + daysRemaining * 24 * 3600 * 1000);
      } else {
        projectedCompletionDate = new Date(); // done
      }
    }

    return {
      totalSaved,
      remaining,
      progressPercentage,
      contributionsByUser: userContributions,
      projectedCompletionDate,
    };
  }
}

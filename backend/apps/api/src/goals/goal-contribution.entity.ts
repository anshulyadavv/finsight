import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index
} from 'typeorm';
import { User } from '../users/user.entity';
import { Goal } from './goal.entity';
import { Transaction } from '../transactions/transaction.entity';

@Entity('goal_contributions')
@Index(['goalId'])
@Index(['userId'])
export class GoalContribution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'goal_id', type: 'varchar' })
  goalId: string;

  @ManyToOne(() => Goal, goal => goal.contributions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'goal_id' })
  goal: Goal;

  @Column({ name: 'user_id', type: 'varchar' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ name: 'transaction_id', type: 'varchar', nullable: true })
  transactionId: string | null;

  @ManyToOne(() => Transaction, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

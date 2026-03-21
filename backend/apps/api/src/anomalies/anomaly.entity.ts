import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  JoinColumn, CreateDateColumn, Index,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Transaction } from '../transactions/transaction.entity';

export enum AnomalyType {
  SUDDEN_SPIKE  = 'sudden_spike',
  DUPLICATE     = 'duplicate',
  CATEGORY_JUMP = 'category_jump',
  UNUSUAL_TIME  = 'unusual_time',
  LARGE_AMOUNT  = 'large_amount',
  MERCHANT      = 'unusual_merchant',
}

@Entity('anomalies')
@Index(['userId', 'createdAt'])
export class Anomaly {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'varchar' })
  userId: string;

  @ManyToOne(() => User, (user) => user.anomalies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'transaction_id', type: 'varchar', nullable: true })
  transactionId: string | null;

  @ManyToOne(() => Transaction, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction | null;

  @Column({ type: 'enum', enum: AnomalyType })
  type: AnomalyType;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'anomaly_score', type: 'float' })
  anomalyScore: number;

  @Column({ name: 'z_score', type: 'float', nullable: true })
  zScore: number | null;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, unknown> | null;

  @Column({ name: 'is_resolved', type: 'boolean', default: false })
  isResolved: boolean;

  @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
  resolvedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
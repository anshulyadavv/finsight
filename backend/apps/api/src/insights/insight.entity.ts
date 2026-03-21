import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  JoinColumn, CreateDateColumn, Index,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum InsightType {
  SPENDING_PATTERN = 'spending_pattern',
  WASTE_DETECTION  = 'waste_detection',
  OPTIMIZATION     = 'optimization',
  SAVING_TIP       = 'saving_tip',
  PEER_COMPARISON  = 'peer_comparison',
  BUDGET_WARNING   = 'budget_warning',
}

export enum InsightSeverity {
  INFO    = 'info',
  WARNING = 'warning',
  ALERT   = 'alert',
  SUCCESS = 'success',
}

@Entity('insights')
@Index(['userId', 'createdAt'])
export class Insight {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'varchar' })
  userId: string;

  @ManyToOne(() => User, (user) => user.insights, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: InsightType })
  type: InsightType;

  @Column({ type: 'enum', enum: InsightSeverity, default: InsightSeverity.INFO })
  severity: InsightSeverity;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', nullable: true })
  impact: string | null;

  @Column({ type: 'boolean', default: true })
  actionable: boolean;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, unknown> | null;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @Column({ name: 'dismissed_at', type: 'timestamp', nullable: true })
  dismissedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany, Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Transaction } from '../transactions/transaction.entity';
import { Budget } from '../budgets/budget.entity';
import { Insight } from '../insights/insight.entity';
import { Notification } from '../notifications/notification.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', unique: true, length: 255 })
  email: string;

  @Exclude()
  @Column({ name: 'password_hash', type: 'varchar' })
  passwordHash: string;

  @Exclude()
  @Column({ name: 'refresh_token', type: 'varchar', nullable: true })
  refreshToken: string | null;

  @Column({ name: 'push_subscription', type: 'jsonb', nullable: true })
  pushSubscription: object | null;

  @Column({ name: 'notification_email', type: 'boolean', default: true })
  notificationEmail: boolean;

  @Column({ name: 'notification_push', type: 'boolean', default: false })
  notificationPush: boolean;

  @Column({ name: 'monthly_income', type: 'decimal', precision: 12, scale: 2, default: 0 })
  monthlyIncome: number;

  @Column({ type: 'varchar', default: 'INR' })
  currency: string;

  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Transaction, (tx) => tx.user)
  transactions: Transaction[];

  @OneToMany(() => Budget, (b) => b.user)
  budgets: Budget[];

  @OneToMany(() => Insight, (i) => i.user)
  insights: Insight[];

  @OneToMany(() => Notification, (n) => n.user)
  notifications: Notification[];

  @OneToMany('Anomaly', 'user')
  anomalies: any[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
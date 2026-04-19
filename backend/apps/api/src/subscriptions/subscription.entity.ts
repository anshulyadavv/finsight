import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  cost: number;

  @Column({ name: 'billing_cycle', default: 'monthly' })
  billingCycle: string;

  @Column({ name: 'icon_label', nullable: true })
  iconLabel: string;

  @Column({ default: true })
  active: boolean;

  @Column({ name: 'billing_day', type: 'int', default: 1 })
  billingDay: number; // Day of the month it bills

  @Column({ name: 'last_billed_date', type: 'date', nullable: true })
  lastBilledDate: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  JoinColumn, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Category } from '../categories/category.entity';

@Entity('budgets')
@Index(['userId', 'categoryId', 'month'], { unique: true })
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'varchar' })
  userId: string;

  @ManyToOne(() => User, (user) => user.budgets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'category_id', type: 'varchar' })
  categoryId: string;

  @ManyToOne(() => Category, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  limit: number;

  @Column({ type: 'varchar', length: 7 })
  month: string;

  @Column({ name: 'alert_at_percent', type: 'int', default: 80 })
  alertAtPercent: number;

  @Column({ name: 'alert_sent', type: 'boolean', default: false })
  alertSent: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
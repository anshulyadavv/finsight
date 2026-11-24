import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('liabilities')
@Index(['userId'])
export class Liability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'varchar' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({ name: 'remaining_amount', type: 'decimal', precision: 12, scale: 2 })
  remainingAmount: number;

  @Column({ name: 'interest_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  interestRate: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  emi: number | null;

  @Column({ name: 'due_date', type: 'int', nullable: true }) // day of month 1-31
  dueDate: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

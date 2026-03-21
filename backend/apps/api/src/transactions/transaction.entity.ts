import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Category } from '../categories/category.entity';

export enum TransactionType {
  INCOME   = 'income',
  EXPENSE  = 'expense',
  TRANSFER = 'transfer',
}

export enum PaymentMethod {
  UPI        = 'upi',
  CARD       = 'card',
  NETBANKING = 'netbanking',
  CASH       = 'cash',
  WALLET     = 'wallet',
  CHEQUE     = 'cheque',
  OTHER      = 'other',
}

@Entity('transactions')
@Index(['userId', 'date'])
@Index(['userId', 'type'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'varchar' })
  userId: string;

  @ManyToOne(() => User, (user) => user.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ name: 'category_id', type: 'varchar', nullable: true })
  categoryId: string | null;

  @ManyToOne(() => Category, { nullable: true, eager: true })
  @JoinColumn({ name: 'category_id' })
  category: Category | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  merchant: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'date' })
  date: Date;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.OTHER,
  })
  paymentMethod: PaymentMethod;

  @Column({ name: 'is_recurring', type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({ name: 'recurring_id', type: 'varchar', nullable: true })
  recurringId: string | null;

  @Column({ name: 'sms_raw', type: 'text', nullable: true })
  smsRaw: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @Column({ name: 'categorization_source', type: 'varchar', nullable: true })
  categorizationSource: string | null;

  @Column({ name: 'categorization_confidence', type: 'float', nullable: true })
  categorizationConfidence: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  brand: string; // 'visa', 'mastercard', 'amex', 'rupay'

  @Column({ length: 16 })
  last4: string;

  @Column({ length: 5 })
  expiry: string; // 'MM/YY'

  @Column()
  nameOnCard: string;

  @Column()
  gradientStart: string;

  @Column()
  gradientEnd: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

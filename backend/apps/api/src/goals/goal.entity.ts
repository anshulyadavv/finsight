import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, Index, OneToMany
} from 'typeorm';
import { User } from '../users/user.entity';
import { GoalMember } from './goal-member.entity';
import { GoalContribution } from './goal-contribution.entity';

@Entity('goals')
@Index(['createdBy'])
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'target_amount', type: 'decimal', precision: 12, scale: 2 })
  targetAmount: number;

  @Column({ type: 'date' })
  deadline: Date;

  @Column({ name: 'created_by', type: 'varchar' })
  createdBy: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ name: 'is_shared', type: 'boolean', default: false })
  isShared: boolean;

  @OneToMany(() => GoalMember, member => member.goal, { cascade: true })
  members: GoalMember[];

  @OneToMany(() => GoalContribution, contribution => contribution.goal, { cascade: true })
  contributions: GoalContribution[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

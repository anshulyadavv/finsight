import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index
} from 'typeorm';
import { User } from '../users/user.entity';
import { Goal } from './goal.entity';

export enum GoalRole {
  OWNER = 'owner',
  CONTRIBUTOR = 'contributor',
}

@Entity('goal_members')
@Index(['userId', 'goalId'], { unique: true })
export class GoalMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'goal_id', type: 'varchar' })
  goalId: string;

  @ManyToOne(() => Goal, goal => goal.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'goal_id' })
  goal: Goal;

  @Column({ name: 'user_id', type: 'varchar' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: GoalRole, default: GoalRole.CONTRIBUTOR })
  role: GoalRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

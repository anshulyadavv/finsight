import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { GoalsService } from './goals.service';
import { GoalsController } from './goals.controller';
import { GoalsProcessor } from './goals.processor';
import { Goal } from './goal.entity';
import { GoalMember } from './goal-member.entity';
import { GoalContribution } from './goal-contribution.entity';
import { TransactionsModule } from '../transactions/transactions.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PredictionsModule } from '../predictions/predictions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Goal, GoalMember, GoalContribution]),
    BullModule.registerQueue({ name: 'goals' }),
    TransactionsModule,
    NotificationsModule,
    PredictionsModule,
  ],
  controllers: [GoalsController],
  providers: [GoalsService, GoalsProcessor],
  exports: [GoalsService],
})
export class GoalsModule {}

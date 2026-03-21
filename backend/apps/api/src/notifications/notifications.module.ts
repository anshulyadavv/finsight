import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { User } from '../users/user.entity';
import { Insight } from '../insights/insight.entity';
import { Anomaly } from '../anomalies/anomaly.entity';
import { Budget } from '../budgets/budget.entity';
import { Transaction } from '../transactions/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Insight, Anomaly, Budget, Transaction])],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';
import { InsightsProcessor } from './insights.processor';
import { Insight } from './insight.entity';
import { Transaction } from '../transactions/transaction.entity';
import { Budget } from '../budgets/budget.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Insight, Transaction, Budget]),
    BullModule.registerQueue({ name: 'insights' }),
    forwardRef(() => NotificationsModule),
  ],
  controllers: [InsightsController],
  providers: [InsightsService, InsightsProcessor],
  exports: [InsightsService],
})
export class InsightsModule {}

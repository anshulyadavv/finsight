import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Transaction } from '../transactions/transaction.entity';
import { Budget } from '../budgets/budget.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Budget])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}

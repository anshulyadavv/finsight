import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Anomaly } from '../anomalies/anomaly.entity';
import { Insight } from '../insights/insight.entity';
import { Notification } from '../notifications/notification.entity';
import { Transaction } from '../transactions/transaction.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Anomaly, Insight, Notification, Transaction])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}

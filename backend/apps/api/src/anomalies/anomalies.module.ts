import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { HttpModule } from '@nestjs/axios';
import { AnomaliesController } from './anomalies.controller';
import { AnomaliesService } from './anomalies.service';
import { AnomaliesProcessor } from './anomalies.processor';
import { Anomaly } from './anomaly.entity';
import { Transaction } from '../transactions/transaction.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Anomaly, Transaction]),
    BullModule.registerQueue({ name: 'anomalies' }),
    HttpModule,
    forwardRef(() => NotificationsModule),
  ],
  controllers: [AnomaliesController],
  providers: [AnomaliesService, AnomaliesProcessor],
  exports: [AnomaliesService],
})
export class AnomaliesModule {}

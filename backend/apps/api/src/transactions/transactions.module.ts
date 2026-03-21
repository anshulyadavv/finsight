import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { MulterModule } from '@nestjs/platform-express';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { Transaction } from './transaction.entity';
import { CategorizationModule } from '../categorization/categorization.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    BullModule.registerQueue(
      { name: 'insights' },
      { name: 'anomalies' },
    ),
    MulterModule.register({ limits: { fileSize: 5 * 1024 * 1024 } }), // 5MB
    CategorizationModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { AssetsProcessor } from './assets.processor';
import { Asset } from './asset.entity';
import { Liability } from './liability.entity';
import { IncomeSource } from './income-source.entity';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asset, Liability, IncomeSource]),
    BullModule.registerQueue({ name: 'assets' }),
    TransactionsModule,
  ],
  controllers: [AssetsController],
  providers: [AssetsService, AssetsProcessor],
  exports: [AssetsService],
})
export class AssetsModule {}

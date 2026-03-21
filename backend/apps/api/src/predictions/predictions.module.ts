import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { PredictionsController } from './predictions.controller';
import { PredictionsService } from './predictions.service';
import { Transaction } from '../transactions/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    HttpModule,
  ],
  controllers: [PredictionsController],
  providers: [PredictionsService],
  exports: [PredictionsService],
})
export class PredictionsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { Transaction } from '../transactions/transaction.entity';
import { Insight } from '../insights/insight.entity';
import { Category } from '../categories/category.entity';
import { PredictionsModule } from '../predictions/predictions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Insight, Category]),
    PredictionsModule,
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}

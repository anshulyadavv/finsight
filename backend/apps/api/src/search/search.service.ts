import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Transaction } from '../transactions/transaction.entity';
import { Insight } from '../insights/insight.entity';
import { Category } from '../categories/category.entity';
import { PredictionsService } from '../predictions/predictions.service';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
    @InjectRepository(Insight)
    private readonly insightRepo: Repository<Insight>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    private readonly predictionsService: PredictionsService,
  ) {}

  async globalSearch(userId: string, query: string) {
    if (!query || query.length < 2) return { transactions: [], insights: [], categories: [], predictions: [] };

    const queryNum = parseFloat(query.replace(/[^0-9.]/g, ''));
    const isNumeric = !isNaN(queryNum) && query.match(/[0-9]/);

    const [transactions, insights, categories, predictionsData] = await Promise.all([
      // 1. Transactions
      this.txRepo.find({
        where: [
          { userId, merchant: ILike(`%${query}%`) },
          { userId, description: ILike(`%${query}%`) },
          ...(isNumeric ? [{ userId, amount: queryNum }] : []),
        ],
        relations: ['category'],
        take: 5,
        order: { date: 'DESC' },
      }),

      // 2. Insights
      this.insightRepo.find({
        where: { userId, message: ILike(`%${query}%`), dismissedAt: null as any },
        take: 3,
      }),

      // 3. Categories
      this.categoryRepo.find({
        where: { name: ILike(`%${query}%`) },
        take: 3,
      }),

      // 4. Predictions (Search within current month's forecast)
      this.predictionsService.getPredictions(userId).catch(() => null),
    ]);

    // Filter predictions by query
    const predictions = (predictionsData as any)?.categoryForecasts?.filter((f: any) => 
      f.category.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 3) || [];

    return {
      transactions,
      insights,
      categories,
      predictions,
    };
  }
}

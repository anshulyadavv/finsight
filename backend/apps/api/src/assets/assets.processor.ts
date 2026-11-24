import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncomeSource, IncomeFrequency } from './income-source.entity';
import { TransactionsService } from '../transactions/transactions.service';
import { CreateTransactionDto } from '../transactions/dto/transaction.dto';
import { TransactionType, PaymentMethod } from '../transactions/transaction.entity';

@Processor('assets')
export class AssetsProcessor {
  private readonly logger = new Logger(AssetsProcessor.name);

  constructor(
    @InjectRepository(IncomeSource) private readonly incomeRepo: Repository<IncomeSource>,
    private readonly txService: TransactionsService,
  ) {}

  @Process('credit-passive-income')
  async handlePassiveIncome(job: Job) {
    this.logger.log(`Processing passive income...`);
    
    // Find all income sources
    const sources = await this.incomeRepo.find();
    
    // In a real system, you would check if it's the right day of the month/year based on source.createdAt
    // For simplicity, we just credit them all if this job is scheduled right.
    for (const source of sources) {
      try {
        const txObj: CreateTransactionDto = {
          amount: Number(source.amount),
          type: TransactionType.INCOME,
          date: new Date().toISOString(),
          description: `Passive income: ${source.name}`,
          merchant: source.name,
          paymentMethod: PaymentMethod.OTHER,
          isRecurring: true,
        };
        await this.txService.create(source.userId, txObj);
        this.logger.log(`Credited passive income for user ${source.userId} - ${source.name}`);
      } catch (e) {
        this.logger.error(`Failed to credit passive income: ${e.message}`);
      }
    }
  }
}

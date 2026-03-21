import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { InsightsService } from './insights.service';

@Processor('insights')
export class InsightsProcessor {
  private readonly logger = new Logger(InsightsProcessor.name);

  constructor(private readonly insightsService: InsightsService) {}

  @Process('generate')
  async handleGenerate(job: Job<{ userId: string }>) {
    this.logger.debug(`Processing insights job for user ${job.data.userId}`);
    try {
      await this.insightsService.generateInsights(job.data.userId);
    } catch (err) {
      this.logger.error(`Insights generation failed: ${(err as Error).message}`);
      throw err;
    }
  }

  @Process('train')
  async handleTrain(job: Job<{ description: string; categoryId: string }>) {
    // Forward correction to ML service for retraining
    this.logger.debug(`ML training correction: ${job.data.description} → ${job.data.categoryId}`);
    // ML service call happens in CategorizationService
  }
}

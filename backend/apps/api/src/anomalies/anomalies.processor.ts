// anomalies.processor.ts
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { AnomaliesService } from './anomalies.service';

@Processor('anomalies')
export class AnomaliesProcessor {
  private readonly logger = new Logger(AnomaliesProcessor.name);

  constructor(private readonly anomaliesService: AnomaliesService) {}

  @Process('detect')
  async handleDetect(job: Job<{ userId: string; transactionId: string }>) {
    this.logger.debug(`Anomaly detection for tx ${job.data.transactionId}`);
    try {
      await this.anomaliesService.detectAnomalies(job.data.userId, job.data.transactionId);
    } catch (err) {
      this.logger.error(`Anomaly detection failed: ${(err as Error).message}`);
      throw err;
    }
  }
}

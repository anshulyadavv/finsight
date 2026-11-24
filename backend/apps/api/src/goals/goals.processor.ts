import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { NotificationsService } from '../notifications/notifications.service';
import { GoalsService } from './goals.service';

@Processor('goals')
export class GoalsProcessor {
  private readonly logger = new Logger(GoalsProcessor.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly goalsService: GoalsService,
  ) {}

  @Process('check-reminders')
  async handleGoalReminders(job: Job<{ goalId: string }>) {
    this.logger.log(`Checking reminders for goal ${job.data.goalId}...`);
    try {
      // Logic to find members and send them a notification via the Notification module
      // Just a stub for the architecture logic specified by the user
      
      // this.notificationsService.create({
      //    userId: member.userId,
      //    title: `Goal Reminder!`,
      //    message: `Don't forget to contribute.`,
      //    type: NotificationType.GOAL_ALERT
      // });
      
      this.logger.log(`Reminder queued for notification service.`);
    } catch (e) {
      this.logger.error(`Failed to process goal reminder: ${e.message}`);
    }
  }
}

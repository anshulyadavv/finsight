// notifications.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  @Post('push/subscribe')
  @ApiOperation({ summary: 'Register Web Push subscription for this device' })
  subscribe(
    @CurrentUser() user: User,
    @Body() subscription: object,
  ) {
    return this.svc.registerPushSubscription(user.id, subscription);
  }
}

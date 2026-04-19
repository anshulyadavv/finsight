import { Controller, Get, Patch, Post, Param, UseGuards, Body } from '@nestjs/common';
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

  @Get()
  @ApiOperation({ summary: 'List notifications for current user' })
  list(@CurrentUser() user: User) {
    return this.svc.list(user);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  read(@Param('id') id: string) {
    return this.svc.markAsRead(id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all as read' })
  readAll(@CurrentUser() user: User) {
    return this.svc.markAllAsRead(user);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive/Clear notification' })
  archive(@Param('id') id: string) {
    return this.svc.archive(id);
  }
}

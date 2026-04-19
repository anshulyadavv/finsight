// insights.controller.ts
import { Controller, Get, Patch, Delete, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { InsightsService } from './insights.service';

@ApiTags('insights')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('insights')
export class InsightsController {
  constructor(private readonly svc: InsightsService) {}

  @Get()
  @ApiOperation({ summary: 'Get AI-generated insights for the current user' })
  getInsights(@CurrentUser() user: User) {
    return this.svc.getInsights(user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark insight as read' })
  markRead(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.svc.markRead(user.id, id);
  }

  @Patch(':id/dismiss')
  @ApiOperation({ summary: 'Dismiss an insight' })
  dismiss(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.svc.dismiss(user.id, id);
  }

  @Delete('purge-stale')
  @ApiOperation({ summary: 'Purge broken/legacy insight records for the current user' })
  purgeStale(@CurrentUser() user: User) {
    return this.svc.purgeStaleInsights(user.id);
  }
}

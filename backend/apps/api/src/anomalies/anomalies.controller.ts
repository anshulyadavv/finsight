// anomalies.controller.ts
import { Controller, Get, Patch, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { AnomaliesService } from './anomalies.service';

@ApiTags('anomalies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('anomalies')
export class AnomaliesController {
  constructor(private readonly svc: AnomaliesService) {}

  @Get()
  @ApiOperation({ summary: 'Get unresolved anomalies for current user' })
  getAnomalies(@CurrentUser() user: User) {
    return this.svc.getAnomalies(user.id);
  }

  @Patch(':id/resolve')
  @ApiOperation({ summary: 'Resolve/dismiss an anomaly' })
  resolve(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.svc.resolve(user.id, id);
  }
}

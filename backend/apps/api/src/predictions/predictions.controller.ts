// predictions.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { PredictionsService } from './predictions.service';

@ApiTags('predictions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('predictions')
export class PredictionsController {
  constructor(private readonly svc: PredictionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get monthly spending forecast and projected savings' })
  getPredictions(@CurrentUser() user: User) {
    return this.svc.getPredictions(user.id);
  }
}

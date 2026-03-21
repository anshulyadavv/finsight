// dashboard.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly svc: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Total balance, income, expenses, savings + trends' })
  @ApiQuery({ name: 'month', required: false, description: 'YYYY-MM (defaults to current month)' })
  getSummary(@CurrentUser() user: User, @Query('month') month?: string) {
    return this.svc.getSummary(user.id, month);
  }

  @Get('overview')
  @ApiOperation({ summary: 'Category spending breakdown for donut chart' })
  @ApiQuery({ name: 'month', required: false })
  getOverview(@CurrentUser() user: User, @Query('month') month?: string) {
    return this.svc.getOverview(user.id, month);
  }

  @Get('money-flow')
  @ApiOperation({ summary: 'Time-series income vs expense data for line chart' })
  @ApiQuery({ name: 'months', required: false, description: 'Number of months (default 6)' })
  getMoneyFlow(
    @CurrentUser() user: User,
    @Query('months') months?: string,
  ) {
    return this.svc.getMoneyFlow(user.id, months ? parseInt(months) : 6);
  }

  @Get('wealth')
  @ApiOperation({ summary: 'Account balances and wealth breakdown' })
  getWealth(@CurrentUser() user: User) {
    return this.svc.getWealth(user.id);
  }
}

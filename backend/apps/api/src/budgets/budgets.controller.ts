// budgets.controller.ts
import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID, Min, Max, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { BudgetsService } from './budgets.service';

class CreateBudgetDto {
  @IsUUID() categoryId: string;
  @IsNumber() @Min(1) @Type(() => Number) limit: number;
  @IsOptional() @IsString() month?: string;
  @IsOptional() @IsInt() @Min(50) @Max(100) @Type(() => Number) alertAtPercent?: number;
}

class UpdateBudgetDto {
  @IsOptional() @IsNumber() @Min(1) @Type(() => Number) limit?: number;
  @IsOptional() @IsInt() @Min(50) @Max(100) @Type(() => Number) alertAtPercent?: number;
}

@ApiTags('budgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly svc: BudgetsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all budgets with current spend usage' })
  findAll(@CurrentUser() user: User, @Query('month') month?: string) {
    return this.svc.findAll(user.id, month);
  }

  @Post()
  @ApiOperation({ summary: 'Create a monthly budget for a category' })
  create(@CurrentUser() user: User, @Body() dto: CreateBudgetDto) {
    return this.svc.create(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a budget limit or alert threshold' })
  update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBudgetDto,
  ) {
    return this.svc.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a budget' })
  remove(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.svc.remove(user.id, id);
  }
}

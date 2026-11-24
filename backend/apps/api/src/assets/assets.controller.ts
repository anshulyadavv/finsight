import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  UseGuards, HttpCode, HttpStatus, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { AssetsService } from './assets.service';
import {
  CreateAssetDto, UpdateAssetDto,
  CreateLiabilityDto, UpdateLiabilityDto,
  CreateIncomeSourceDto, UpdateIncomeSourceDto
} from './dto/asset.dto';

@ApiTags('assets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class AssetsController {
  constructor(private readonly svc: AssetsService) {}

  // --- Assets ---
  @Post('assets')
  @ApiOperation({ summary: 'Create an asset' })
  createAsset(@CurrentUser() user: User, @Body() dto: CreateAssetDto) {
    return this.svc.createAsset(user.id, dto);
  }

  @Get('assets')
  @ApiOperation({ summary: 'List all assets' })
  getAssets(@CurrentUser() user: User) {
    return this.svc.getAssets(user.id);
  }

  @Patch('assets/:id')
  @ApiOperation({ summary: 'Update an asset' })
  updateAsset(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAssetDto,
  ) {
    return this.svc.updateAsset(user.id, id, dto);
  }

  @Delete('assets/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an asset' })
  deleteAsset(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.svc.deleteAsset(user.id, id);
  }

  // --- Liabilities ---
  @Post('liabilities')
  @ApiOperation({ summary: 'Create a liability' })
  createLiability(@CurrentUser() user: User, @Body() dto: CreateLiabilityDto) {
    return this.svc.createLiability(user.id, dto);
  }

  @Get('liabilities')
  @ApiOperation({ summary: 'List all liabilities' })
  getLiabilities(@CurrentUser() user: User) {
    return this.svc.getLiabilities(user.id);
  }

  @Patch('liabilities/:id')
  @ApiOperation({ summary: 'Update a liability' })
  updateLiability(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLiabilityDto,
  ) {
    return this.svc.updateLiability(user.id, id, dto);
  }

  @Delete('liabilities/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a liability' })
  deleteLiability(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.svc.deleteLiability(user.id, id);
  }

  // --- Income Sources ---
  @Post('income-sources')
  createIncomeSource(@CurrentUser() user: User, @Body() dto: CreateIncomeSourceDto) {
    return this.svc.createIncomeSource(user.id, dto);
  }

  @Get('income-sources')
  getIncomeSources(@CurrentUser() user: User) {
    return this.svc.getIncomeSources(user.id);
  }

  @Patch('income-sources/:id')
  updateIncomeSource(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIncomeSourceDto,
  ) {
    return this.svc.updateIncomeSource(user.id, id, dto);
  }

  @Delete('income-sources/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteIncomeSource(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.svc.deleteIncomeSource(user.id, id);
  }

  // --- Net Worth ---
  @Get('net-worth')
  @ApiOperation({ summary: 'Get current net worth breakdown' })
  getNetWorth(@CurrentUser() user: User) {
    return this.svc.getNetWorth(user.id);
  }
}

import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { GoalsService } from './goals.service';
import { CreateGoalDto, UpdateGoalDto, AddContributionDto } from './dto/goal.dto';

@ApiTags('goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private readonly svc: GoalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new goal' })
  create(@CurrentUser() user: User, @Body() dto: CreateGoalDto) {
    return this.svc.createGoal(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all goals the user is part of' })
  findAll(@CurrentUser() user: User) {
    return this.svc.getGoals(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific goal' })
  findOne(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.svc.getGoal(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a goal' })
  update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGoalDto,
  ) {
    return this.svc.updateGoal(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a goal' })
  remove(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.svc.deleteGoal(user.id, id);
  }

  @Post(':id/invite')
  @ApiOperation({ summary: 'Invite a user to a goal by user ID' })
  invite(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('inviteeId') inviteeId: string,
  ) {
    return this.svc.inviteUserToGoal(user.id, id, inviteeId);
  }

  @Post(':id/contribute')
  @ApiOperation({ summary: 'Add a contribution to a goal' })
  contribute(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddContributionDto,
  ) {
    return this.svc.addContribution(user.id, id, dto);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Get detailed progress statistics for a goal' })
  getProgress(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.svc.getGoalProgress(user.id, id);
  }
}

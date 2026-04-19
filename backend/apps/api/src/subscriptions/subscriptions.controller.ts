import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subService: SubscriptionsService) {}

  @Get()
  async getSubscriptions(@Request() req: any) {
    return this.subService.findAll(req.user.id);
  }

  @Post()
  async createSubscription(@Request() req: any, @Body() body: any) {
    return this.subService.create(req.user.id, body);
  }

  @Patch(':id')
  async updateSubscription(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.subService.update(req.user.id, id, body);
  }

  @Delete(':id')
  async deleteSubscription(@Request() req: any, @Param('id') id: string) {
    return this.subService.delete(req.user.id, id);
  }
}

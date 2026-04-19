import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { CardsService } from './cards.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cards')
@UseGuards(JwtAuthGuard)
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  async getCards(@Request() req: any) {
    return this.cardsService.findAll(req.user.id);
  }

  @Post()
  async createCard(@Request() req: any, @Body() body: any) {
    return this.cardsService.create(req.user.id, body);
  }

  @Delete(':id')
  async deleteCard(@Request() req: any, @Param('id') id: string) {
    return this.cardsService.delete(req.user.id, id);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './card.entity';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private cardRepo: Repository<Card>,
  ) {}

  async findAll(userId: string): Promise<Card[]> {
    return this.cardRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async create(userId: string, data: Partial<Card>): Promise<Card> {
    const card = this.cardRepo.create({ ...data, userId });
    return this.cardRepo.save(card);
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.cardRepo.delete({ id, userId });
  }
}

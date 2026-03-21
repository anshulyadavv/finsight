import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

const SYSTEM_CATEGORIES = [
  { name: 'Food',          icon: '🍔', color: '#f59e0b' },
  { name: 'Transport',     icon: '🚗', color: '#3b82f6' },
  { name: 'Shopping',      icon: '🛍️',  color: '#ec4899' },
  { name: 'Housing',       icon: '🏠', color: '#8b5cf6' },
  { name: 'Health',        icon: '❤️',  color: '#ef4444' },
  { name: 'Entertainment', icon: '🎬', color: '#06b6d4' },
  { name: 'Utilities',     icon: '⚡',  color: '#10b981' },
  { name: 'Education',     icon: '📚', color: '#0f766e' },
  { name: 'Finance',       icon: '💳', color: '#64748b' },
  { name: 'Other',         icon: '📦', color: '#9ca3af' },
];

@Injectable()
export class CategoriesService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  async onApplicationBootstrap() {
    await this.seed();
  }

  async seed() {
    for (const cat of SYSTEM_CATEGORIES) {
      const exists = await this.repo.findOne({ where: { name: cat.name } });
      if (!exists) {
        await this.repo.save(this.repo.create({ ...cat, isSystem: true }));
      }
    }
    this.logger.log('Categories seeded');
  }

  findAll() {
    return this.repo.find({ order: { name: 'ASC' } });
  }
}

// categorization.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Category } from '../categories/category.entity';
import { CategorizationService } from './categorization.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), HttpModule],
  providers: [CategorizationService],
  exports: [CategorizationService],
})
export class CategorizationModule {}

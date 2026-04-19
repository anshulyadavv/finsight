import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CategoriesModule } from './categories/categories.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { InsightsModule } from './insights/insights.module';
import { AnomaliesModule } from './anomalies/anomalies.module';
import { PredictionsModule } from './predictions/predictions.module';
import { BudgetsModule } from './budgets/budgets.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CategorizationModule } from './categorization/categorization.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { CardsModule } from './cards/cards.module';
import { SearchModule } from './search/search.module';
import { HealthController } from './common/controllers/health.controller';
import { Transaction } from './transactions/transaction.entity';
import { Category } from './categories/category.entity';
import { Card } from './cards/card.entity';
import { Notification } from './notifications/notification.entity';
import { User } from './users/user.entity';

import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import jwtConfig from './config/jwt.config';
import mlConfig from './config/ml.config';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, jwtConfig, mlConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get('database.host'),
        port: cfg.get('database.port'),
        username: cfg.get('database.username'),
        password: cfg.get('database.password'),
        database: cfg.get('database.name'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        synchronize: cfg.get('database.synchronize'),
        logging: cfg.get('database.logging'),
        ssl: cfg.get('database.ssl') ? { rejectUnauthorized: false } : false,
      }),
    }),

    // Cache
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (cfg: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: cfg.get('redis.host'),
            port: cfg.get('redis.port'),
          },
          password: cfg.get('redis.password'),
          ttl: cfg.get('redis.ttl') * 1000, // milliseconds
        }),
      }),
    }),

    // BullMQ Queues
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        redis: {
          host: cfg.get('redis.host'),
          port: cfg.get('redis.port'),
          password: cfg.get('redis.password'),
        },
      }),
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      { name: 'short',  ttl: 1000,  limit: 10 },
      { name: 'medium', ttl: 10000, limit: 50 },
      { name: 'long',   ttl: 60000, limit: 200 },
    ]),

    // Cron jobs
    ScheduleModule.forRoot(),

    // Feature modules
    AuthModule,
    UsersModule,
    TransactionsModule,
    CategoriesModule,
    DashboardModule,
    InsightsModule,
    AnomaliesModule,
    PredictionsModule,
    BudgetsModule,
    NotificationsModule,
    CategorizationModule,
    SubscriptionsModule,
    CardsModule,
    SearchModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from '../users/user.entity';
import { Anomaly } from '../anomalies/anomaly.entity';
import { Insight } from '../insights/insight.entity';
import { Notification } from '../notifications/notification.entity';
import { Transaction } from '../transactions/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Anomaly, Insight, Notification, Transaction]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}), // secrets loaded dynamically in strategy
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}

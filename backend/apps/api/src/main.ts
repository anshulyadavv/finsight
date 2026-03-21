import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global filters & interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Swagger API docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('FinIQ API')
    .setDescription('Personal Finance Intelligence Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication & Authorization')
    .addTag('transactions', 'Transaction Management')
    .addTag('dashboard', 'Dashboard Aggregation')
    .addTag('insights', 'AI-powered Insights')
    .addTag('anomalies', 'Anomaly Detection')
    .addTag('predictions', 'Spending Predictions')
    .addTag('budgets', 'Budget Management')
    .addTag('notifications', 'Notification Service')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log(`🚀 FinIQ API running on http://localhost:${port}/api/v1`);
  logger.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();

import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host:        process.env.DB_HOST     || 'localhost',
  port:        parseInt(process.env.DB_PORT || '5432', 10),
  username:    process.env.DB_USERNAME || 'finiq',
  password:    process.env.DB_PASSWORD || 'finiq_secret',
  name:        process.env.DB_NAME     || 'finiq_db',
  synchronize: process.env.NODE_ENV !== 'production',
  logging:     process.env.DB_LOGGING  === 'true',
  ssl:         process.env.DB_SSL      === 'true',
}));

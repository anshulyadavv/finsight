import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  accessSecret:      process.env.JWT_ACCESS_SECRET      || 'finiq-access-secret-change-in-prod',
  refreshSecret:     process.env.JWT_REFRESH_SECRET     || 'finiq-refresh-secret-change-in-prod',
  accessExpiresIn:   process.env.JWT_ACCESS_EXPIRES_IN  || '15m',
  refreshExpiresIn:  process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}));

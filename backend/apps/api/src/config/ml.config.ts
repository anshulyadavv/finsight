import { registerAs } from '@nestjs/config';

export default registerAs('ml', () => ({
  baseUrl: process.env.ML_SERVICE_URL     || 'http://localhost:8000',
  timeout: parseInt(process.env.ML_TIMEOUT || '10000', 10),
  apiKey:  process.env.ML_API_KEY          || 'ml-internal-key',
}));

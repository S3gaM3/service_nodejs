// Vercel serverless function handler
// Просто экспортируем Express app - @vercel/node автоматически обработает его
import app from '../src/index';

export default app;

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import userRoutes from './routes/userRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Инициализация БД перед обработкой запросов (оптимизировано для serverless)
let dbConnectionPromise: Promise<void> | null = null;

const initializeDatabase = async (): Promise<void> => {
  if (!dbConnectionPromise) {
    dbConnectionPromise = connectDatabase();
  }
  return dbConnectionPromise;
};

// Middleware для инициализации БД
app.use(async (req, res, next) => {
  try {
    await initializeDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

// Health check (должен быть перед другими роутами)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Service is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/users', userRoutes);

// Корневой путь
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'User Management API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      register: '/api/users/register',
      login: '/api/users/login',
      users: '/api/users',
    },
  });
});

// Error handler (должен быть последним)
app.use(errorHandler);

// Экспорт для Vercel
export default app;

import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import userRoutes from './routes/userRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Service is running',
  });
});

// Error handler (должен быть последним)
app.use(errorHandler);

// Инициализация базы данных
let dbInitialized = false;

const initializeDatabase = async () => {
  if (dbInitialized) {
    return;
  }
  
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('Database connected successfully');
    }
    dbInitialized = true;
  } catch (error) {
    console.error('Error during database initialization:', error);
    throw error;
  }
};

// Инициализация БД перед обработкой запросов
app.use(async (req, res, next) => {
  try {
    await initializeDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

// Экспорт для Vercel
export default app;


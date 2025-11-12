import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import mongoose from 'mongoose';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Обработка кастомных ошибок приложения
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Обработка ошибок валидации Mongoose
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors)
      .map((error) => error.message)
      .join('; ');
    
    return res.status(400).json({
      status: 'error',
      message: messages || 'Validation error',
    });
  }

  // Обработка ошибок дублирования (unique constraint)
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern || {})[0] || 'field';
    return res.status(400).json({
      status: 'error',
      message: `A record with this ${field} already exists`,
    });
  }

  // Обработка ошибок валидации class-validator
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }

  // Обработка ошибок JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token',
    });
  }

  // Обработка ошибок базы данных (старые TypeORM ошибки для совместимости)
  if (err.name === 'QueryFailedError') {
    const dbError = err as any;
    if (dbError.code === '23505') {
      return res.status(400).json({
        status: 'error',
        message: 'A record with this value already exists',
      });
    }
    return res.status(400).json({
      status: 'error',
      message: 'Database error occurred',
    });
  }

  // Неизвестная ошибка
  console.error('Unexpected error:', err);
  return res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  });
};

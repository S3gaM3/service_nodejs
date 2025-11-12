import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Обработка ошибок валидации
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }

  // Обработка ошибок базы данных
  if (err.name === 'QueryFailedError') {
    const dbError = err as any;
    // Обработка ошибки уникальности (например, дублирование email)
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
    message: 'Internal server error',
  });
};


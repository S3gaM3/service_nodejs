import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User';
import { UnauthorizedError } from '../utils/errors';

// Кэшируем JWT секрет для производительности
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token not provided');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('Token not provided');
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
    };

    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid or inactive user');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return next(error);
    }
    // Обработка JWT ошибок
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedError('Invalid or expired token'));
    }
    next(new UnauthorizedError('Invalid token'));
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  if (req.user.role !== UserRole.ADMIN) {
    return next(new UnauthorizedError('Admin access required'));
  }

  next();
};

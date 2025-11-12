import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User';
import { UnauthorizedError } from '../utils/errors';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('Token not provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
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

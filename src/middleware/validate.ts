import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ValidationError as AppValidationError } from '../utils/errors';

export const validateRequest = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToInstance(dtoClass, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      const messages = errors
        .map((error: ValidationError) =>
          Object.values(error.constraints || {}).join(', ')
        )
        .join('; ');

      return next(new AppValidationError(messages));
    }

    req.body = dto;
    next();
  };
};


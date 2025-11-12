import {
  IsEmail,
  IsString,
  MinLength,
  IsDateString,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { UserRole } from '../models/User';

export class RegisterDto {
  @IsString()
  fullName: string;

  @IsDateString()
  dateOfBirth: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}


import mongoose, { Schema, Document } from 'mongoose';
import { IsEmail, IsEnum, IsBoolean, IsDateString, MinLength } from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  fullName: string;
  dateOfBirth: Date;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Автоматически создает createdAt и updatedAt
    collection: 'users',
  }
);

// Индекс для быстрого поиска по email
UserSchema.index({ email: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);

// Экспортируем тип для использования в других местах
export type User = IUser;

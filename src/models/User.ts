import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsEmail, IsEnum, IsBoolean, IsDateString, MinLength } from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ name: 'date_of_birth', type: 'date' })
  @IsDateString()
  dateOfBirth: Date;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column()
  @MinLength(6)
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  @IsEnum(UserRole)
  role: UserRole;

  @Column({ name: 'is_active', default: true })
  @IsBoolean()
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}


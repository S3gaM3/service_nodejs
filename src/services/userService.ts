import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../models/User';
import {
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
} from '../utils/errors';
import { RegisterDto } from '../dto/RegisterDto';
import { LoginDto } from '../dto/LoginDto';

export class UserService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async register(dto: RegisterDto): Promise<{ user: User; token: string }> {
    // Проверка существования пользователя
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ValidationError('User with this email already exists');
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Создание пользователя
    const user = this.userRepository.create({
      fullName: dto.fullName,
      dateOfBirth: new Date(dto.dateOfBirth),
      email: dto.email,
      password: hashedPassword,
      role: dto.role || UserRole.USER,
      isActive: true,
    });

    const savedUser = await this.userRepository.save(user);

    // Генерация токена
    const token = this.generateToken(savedUser.id);

    // Удаление пароля из ответа
    const { password, ...userWithoutPassword } = savedUser;

    return {
      user: userWithoutPassword as User,
      token,
    };
  }

  async login(dto: LoginDto): Promise<{ user: User; token: string }> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('User account is blocked');
    }

    const token = this.generateToken(user.id);

    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as User,
      token,
    };
  }

  async getUserById(userId: string, requesterId: string): Promise<User> {
    const requester = await this.userRepository.findOne({
      where: { id: requesterId },
    });

    if (!requester) {
      throw new UnauthorizedError('Requester not found');
    }

    // Проверка прав доступа
    if (requester.id !== userId && requester.role !== UserRole.ADMIN) {
      throw new ForbiddenError('Access denied');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async getAllUsers(requesterId: string): Promise<User[]> {
    const requester = await this.userRepository.findOne({
      where: { id: requesterId },
    });

    if (!requester || requester.role !== UserRole.ADMIN) {
      throw new ForbiddenError('Admin access required');
    }

    const users = await this.userRepository.find({
      select: ['id', 'fullName', 'dateOfBirth', 'email', 'role', 'isActive', 'createdAt', 'updatedAt'],
    });

    return users;
  }

  async blockUser(userId: string, requesterId: string): Promise<User> {
    const requester = await this.userRepository.findOne({
      where: { id: requesterId },
    });

    if (!requester) {
      throw new UnauthorizedError('Requester not found');
    }

    // Проверка прав доступа
    if (requester.id !== userId && requester.role !== UserRole.ADMIN) {
      throw new ForbiddenError('Access denied');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    user.isActive = false;
    const updatedUser = await this.userRepository.save(user);

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword as User;
  }

  private generateToken(userId: string): string {
    const secret: string = process.env.JWT_SECRET || 'secret';
    const expiresIn: string | number = process.env.JWT_EXPIRES_IN || '24h';
    
    return jwt.sign(
      { userId },
      secret,
      {
        expiresIn: expiresIn as string,
      }
    );
  }
}


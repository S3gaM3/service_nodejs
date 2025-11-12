import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { User, UserRole, IUserPublic } from '../models/User';
import {
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
} from '../utils/errors';
import { RegisterDto } from '../dto/RegisterDto';
import { LoginDto } from '../dto/LoginDto';
import { removePassword } from '../utils/userHelpers';

// Кэшируем JWT секрет для производительности
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '24h';

export class UserService {
  async register(dto: RegisterDto): Promise<{ user: IUserPublic; token: string }> {
    // Проверка существования пользователя
    const existingUser = await User.findOne({ email: dto.email.toLowerCase() });

    if (existingUser) {
      throw new ValidationError('User with this email already exists');
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Создание пользователя
    const user = new User({
      fullName: dto.fullName,
      dateOfBirth: new Date(dto.dateOfBirth),
      email: dto.email.toLowerCase(),
      password: hashedPassword,
      role: dto.role || UserRole.USER,
      isActive: true,
    });

    const savedUser = await user.save();

    // Генерация токена
    const token = this.generateToken(savedUser._id.toString());

    return {
      user: removePassword(savedUser),
      token,
    };
  }

  async login(dto: LoginDto): Promise<{ user: IUserPublic; token: string }> {
    const user = await User.findOne({ email: dto.email.toLowerCase() });

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

    const token = this.generateToken(user._id.toString());

    return {
      user: removePassword(user),
      token,
    };
  }

  async getUserById(userId: string, requesterId: string): Promise<IUserPublic> {
    // Оптимизация: проверяем права доступа и получаем пользователя параллельно
    const [requester, user] = await Promise.all([
      User.findById(requesterId),
      User.findById(userId),
    ]);

    if (!requester) {
      throw new UnauthorizedError('Requester not found');
    }

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Проверка прав доступа
    if (requester._id.toString() !== userId && requester.role !== UserRole.ADMIN) {
      throw new ForbiddenError('Access denied');
    }

    return removePassword(user);
  }

  async getAllUsers(requesterId: string): Promise<IUserPublic[]> {
    const requester = await User.findById(requesterId);

    if (!requester || requester.role !== UserRole.ADMIN) {
      throw new ForbiddenError('Admin access required');
    }

    // Оптимизация: исключаем пароль сразу в запросе
    const users = await User.find({}, { password: 0 });

    return users.map((user) => removePassword(user));
  }

  async blockUser(userId: string, requesterId: string): Promise<IUserPublic> {
    // Оптимизация: проверяем права доступа и получаем пользователя параллельно
    const [requester, user] = await Promise.all([
      User.findById(requesterId),
      User.findById(userId),
    ]);

    if (!requester) {
      throw new UnauthorizedError('Requester not found');
    }

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Проверка прав доступа
    if (requester._id.toString() !== userId && requester.role !== UserRole.ADMIN) {
      throw new ForbiddenError('Access denied');
    }

    user.isActive = false;
    const updatedUser = await user.save();

    return removePassword(updatedUser);
  }

  private generateToken(userId: string): string {
    const options: SignOptions = {
      expiresIn: JWT_EXPIRES_IN as StringValue,
    };
    
    return jwt.sign(
      { userId },
      JWT_SECRET,
      options
    );
  }
}

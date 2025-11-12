import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User, UserRole, IUser, IUserPublic } from '../models/User';
import {
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
} from '../utils/errors';
import { RegisterDto } from '../dto/RegisterDto';
import { LoginDto } from '../dto/LoginDto';

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

    // Удаление пароля из ответа
    const userObject = savedUser.toObject();
    const { password, ...userWithoutPassword } = userObject;

    return {
      user: userWithoutPassword as IUserPublic,
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

    const userObject = user.toObject();
    const { password, ...userWithoutPassword } = userObject;

    return {
      user: userWithoutPassword as IUserPublic,
      token,
    };
  }

  async getUserById(userId: string, requesterId: string): Promise<IUserPublic> {
    const requester = await User.findById(requesterId);

    if (!requester) {
      throw new UnauthorizedError('Requester not found');
    }

    // Проверка прав доступа
    if (requester._id.toString() !== userId && requester.role !== UserRole.ADMIN) {
      throw new ForbiddenError('Access denied');
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const userObject = user.toObject();
    const { password, ...userWithoutPassword } = userObject;
    return userWithoutPassword as IUserPublic;
  }

  async getAllUsers(requesterId: string): Promise<IUserPublic[]> {
    const requester = await User.findById(requesterId);

    if (!requester || requester.role !== UserRole.ADMIN) {
      throw new ForbiddenError('Admin access required');
    }

    const users = await User.find(
      {},
      { password: 0 } // Исключаем пароль из результата
    );

    return users.map((user) => {
      const userObject = user.toObject();
      const { password, ...userWithoutPassword } = userObject;
      return userWithoutPassword as IUserPublic;
    });
  }

  async blockUser(userId: string, requesterId: string): Promise<IUserPublic> {
    const requester = await User.findById(requesterId);

    if (!requester) {
      throw new UnauthorizedError('Requester not found');
    }

    // Проверка прав доступа
    if (requester._id.toString() !== userId && requester.role !== UserRole.ADMIN) {
      throw new ForbiddenError('Access denied');
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    user.isActive = false;
    const updatedUser = await user.save();

    const userObject = updatedUser.toObject();
    const { password, ...userWithoutPassword } = userObject;
    return userWithoutPassword as IUserPublic;
  }

  private generateToken(userId: string): string {
    const secret: string = process.env.JWT_SECRET || 'secret';
    const expiresIn: string = process.env.JWT_EXPIRES_IN || '24h';
    
    const options: SignOptions = {
      expiresIn: expiresIn,
    };
    
    return jwt.sign(
      { userId },
      secret,
      options
    );
  }
}

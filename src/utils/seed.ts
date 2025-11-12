import { User, UserRole } from '../models/User';
import bcrypt from 'bcrypt';
import { clearDatabase } from './clearDatabase';

interface SeedUser {
  fullName: string;
  dateOfBirth: Date;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
}

const defaultPassword = 'password123'; // Пароль по умолчанию для всех пользователей

const seedUsers: SeedUser[] = [
  // Администратор
  {
    fullName: 'Администратор Системы',
    dateOfBirth: new Date('1985-01-15'),
    email: 'admin@example.com',
    password: defaultPassword,
    role: UserRole.ADMIN,
    isActive: true,
  },
  // Обычные пользователи
  {
    fullName: 'Иванов Иван Иванович',
    dateOfBirth: new Date('1990-05-20'),
    email: 'ivanov@example.com',
    password: defaultPassword,
    role: UserRole.USER,
    isActive: true,
  },
  {
    fullName: 'Петрова Мария Сергеевна',
    dateOfBirth: new Date('1992-08-12'),
    email: 'petrova@example.com',
    password: defaultPassword,
    role: UserRole.USER,
    isActive: true,
  },
  {
    fullName: 'Сидоров Петр Александрович',
    dateOfBirth: new Date('1988-03-25'),
    email: 'sidorov@example.com',
    password: defaultPassword,
    role: UserRole.USER,
    isActive: true,
  },
  {
    fullName: 'Козлова Анна Дмитриевна',
    dateOfBirth: new Date('1995-11-08'),
    email: 'kozlova@example.com',
    password: defaultPassword,
    role: UserRole.USER,
    isActive: true,
  },
  {
    fullName: 'Морозов Дмитрий Викторович',
    dateOfBirth: new Date('1987-07-30'),
    email: 'morozov@example.com',
    password: defaultPassword,
    role: UserRole.USER,
    isActive: true,
  },
  {
    fullName: 'Волкова Елена Николаевна',
    dateOfBirth: new Date('1993-02-14'),
    email: 'volkova@example.com',
    password: defaultPassword,
    role: UserRole.USER,
    isActive: true,
  },
  {
    fullName: 'Новиков Алексей Игоревич',
    dateOfBirth: new Date('1991-09-18'),
    email: 'novikov@example.com',
    password: defaultPassword,
    role: UserRole.USER,
    isActive: true,
  },
  {
    fullName: 'Федорова Ольга Владимировна',
    dateOfBirth: new Date('1994-06-22'),
    email: 'fedorova@example.com',
    password: defaultPassword,
    role: UserRole.USER,
    isActive: true,
  },
  {
    fullName: 'Лебедев Сергей Павлович',
    dateOfBirth: new Date('1989-12-05'),
    email: 'lebedev@example.com',
    password: defaultPassword,
    role: UserRole.USER,
    isActive: true,
  },
  {
    fullName: 'Соколова Татьяна Андреевна',
    dateOfBirth: new Date('1996-04-10'),
    email: 'sokolova@example.com',
    password: defaultPassword,
    role: UserRole.USER,
    isActive: true,
  },
];

export const seedDatabase = async (force: boolean = false): Promise<void> => {
  try {
    // Проверяем, есть ли уже пользователи в базе
    const userCount = await User.countDocuments();

    if (userCount > 0 && !force) {
      console.log('База данных уже содержит пользователей. Пропускаем инициализацию.');
      console.log('Используйте force=true или скрипт seed:force для пересоздания пользователей.');
      return;
    }

    if (force && userCount > 0) {
      console.log('Очистка базы данных перед инициализацией...');
      await clearDatabase();
    }

    console.log('Начинаем инициализацию базы данных...');

    // Хешируем пароли для всех пользователей
    const hashedUsers = await Promise.all(
      seedUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      }))
    );

    // Создаем пользователей
    await User.insertMany(hashedUsers);

    console.log(`✅ Успешно создано ${seedUsers.length} пользователей:`);
    console.log(`   - 1 администратор: admin@example.com`);
    console.log(`   - ${seedUsers.length - 1} обычных пользователей`);
    console.log(`   - Пароль по умолчанию для всех: ${defaultPassword}`);
  } catch (error) {
    console.error('Ошибка при инициализации базы данных:', error);
    throw error;
  }
};


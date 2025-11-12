import 'dotenv/config';
import mongoose from 'mongoose';
import '../models/User'; // Импортируем модель для регистрации схемы
import { seedDatabase } from '../utils/seed';

const runSeed = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI or MONGO_URI environment variable is not set');
    }

    console.log('Подключение к MongoDB...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('MongoDB connected successfully');

    // Проверяем флаг --force для принудительной пересоздания
    const force = process.argv.includes('--force') || process.argv.includes('-f');

    await seedDatabase(force);

    console.log('Инициализация завершена успешно!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при выполнении seed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

runSeed();


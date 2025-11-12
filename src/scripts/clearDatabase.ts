import 'dotenv/config';
import mongoose from 'mongoose';
import '../models/User'; // Импортируем модель для регистрации схемы
import { clearDatabase } from '../utils/clearDatabase';

const runClear = async () => {
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

    await clearDatabase();

    console.log('База данных очищена успешно!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при очистке базы данных:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

runClear();


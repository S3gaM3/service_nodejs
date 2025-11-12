import mongoose from 'mongoose';
import { MongoClient, MongoClientOptions } from 'mongodb';
import { attachDatabasePool } from '@vercel/functions';

// Конфигурация для MongoDB
const options: MongoClientOptions = {
  appName: 'user-service.vercel.integration',
  maxIdleTimeMS: 5000,
};

// Создаем клиент для Vercel Functions
const uri = process.env.MONGODB_URI || process.env.MONGO_URI || '';
const client = new MongoClient(uri, options);

// Прикрепляем пул соединений для правильной работы в serverless окружении
if (process.env.VERCEL) {
  attachDatabasePool(client);
}

// Функция подключения к MongoDB
export const connectDatabase = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1) {
      return; // Уже подключено
    }

    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI or MONGO_URI environment variable is not set');
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

// Экспортируем клиент для использования в других местах (если нужно)
export { client };

export default mongoose;

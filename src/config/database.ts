import mongoose from 'mongoose';

// Кэшируем URI для производительности
const getMongoUri = (): string => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  
  if (!uri) {
    throw new Error('MONGODB_URI or MONGO_URI environment variable is not set');
  }
  
  return uri;
};

// Функция подключения к MongoDB с оптимизацией для serverless
export const connectDatabase = async (): Promise<void> => {
  try {
    // Проверяем, не подключены ли мы уже
    if (mongoose.connection.readyState === 1) {
      return; // Уже подключено
    }

    // Если соединение в процессе установки, ждем его
    if (mongoose.connection.readyState === 2) {
      await new Promise((resolve) => {
        mongoose.connection.once('connected', resolve);
      });
      return;
    }

    const mongoUri = getMongoUri();

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10, // Максимальное количество соединений в пуле
      minPoolSize: 1, // Минимальное количество соединений
      bufferCommands: false, // Отключаем буферизацию команд для serverless
      bufferMaxEntries: 0, // Отключаем буферизацию для serverless
    });

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

export default mongoose;

import mongoose from 'mongoose';

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
      maxPoolSize: 10, // Максимальное количество соединений в пуле
    });

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

export default mongoose;

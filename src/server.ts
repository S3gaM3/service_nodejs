import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import app from './index';

dotenv.config();

const PORT = process.env.PORT || 3000;

// Инициализация базы данных и запуск сервера для локальной разработки
connectDatabase()
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error during database initialization:', error);
    process.exit(1);
  });

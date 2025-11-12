import 'reflect-metadata';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import app from './index';

dotenv.config();

const PORT = process.env.PORT || 3000;

// Инициализация базы данных и запуск сервера для локальной разработки
AppDataSource.initialize()
  .then(() => {
    console.log('Database connected successfully');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error during database initialization:', error);
    process.exit(1);
  });


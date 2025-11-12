import { DataSource } from 'typeorm';
import { User } from '../models/User';

// Поддержка Vercel Postgres (POSTGRES_URL) и стандартных переменных окружения
const getDataSourceConfig = () => {
  // Приоритет: Vercel Postgres URL
  if (process.env.POSTGRES_URL) {
    return {
      type: 'postgres' as const,
      url: process.env.POSTGRES_URL,
      entities: [User],
      // В production используйте миграции вместо synchronize
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
      // Vercel Postgres всегда требует SSL
      ssl: {
        rejectUnauthorized: false,
      },
      // Дополнительные настройки для стабильности соединения
      extra: {
        max: 10, // Максимальное количество соединений в пуле
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      },
    };
  }

  // Fallback: стандартные переменные окружения для локальной разработки
  return {
    type: 'postgres' as const,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'user_service',
    entities: [User],
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
    // Для локальной разработки SSL обычно не требуется
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  };
};

export const AppDataSource = new DataSource(getDataSourceConfig());


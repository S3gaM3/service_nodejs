import { User } from '../models/User';

/**
 * Очищает базу данных от всех пользователей
 */
export const clearDatabase = async (): Promise<void> => {
  try {
    const deletedCount = await User.deleteMany({});
    console.log(`✅ Удалено пользователей: ${deletedCount.deletedCount}`);
  } catch (error) {
    console.error('Ошибка при очистке базы данных:', error);
    throw error;
  }
};


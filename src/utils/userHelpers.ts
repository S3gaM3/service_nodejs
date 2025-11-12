import { IUser, IUserPublic } from '../models/User';

/**
 * Удаляет пароль из объекта пользователя
 */
export const removePassword = (user: IUser): IUserPublic => {
  const userObject = user.toObject();
  const { password, ...userWithoutPassword } = userObject;
  return userWithoutPassword as IUserPublic;
};


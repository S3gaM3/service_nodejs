import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { RegisterDto } from '../dto/RegisterDto';
import { LoginDto } from '../dto/LoginDto';

const router = Router();
const userController = new UserController();

// Регистрация (публичный endpoint)
router.post(
  '/register',
  validateRequest(RegisterDto),
  userController.register
);

// Авторизация (публичный endpoint)
router.post('/login', validateRequest(LoginDto), userController.login);

// Получение пользователя по ID (требует аутентификации)
router.get('/:id', authenticate, userController.getUserById);

// Получение списка пользователей (только для админа)
router.get('/', authenticate, requireAdmin, userController.getAllUsers);

// Блокировка пользователя (требует аутентификации)
router.patch('/:id/block', authenticate, userController.blockUser);

export default router;


import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { RegisterDto } from '../dto/RegisterDto';
import { LoginDto } from '../dto/LoginDto';

const router = Router();
const userController = new UserController();

// Публичные endpoints
router.post(
  '/register',
  validateRequest(RegisterDto),
  userController.register
);

router.post('/login', validateRequest(LoginDto), userController.login);

// Защищенные endpoints
// ВАЖНО: GET / должен быть ПЕРЕД GET /:id, иначе /:id перехватит запрос к /
router.get('/', authenticate, requireAdmin, userController.getAllUsers);

router.get('/:id', authenticate, userController.getUserById);

router.patch('/:id/block', authenticate, userController.blockUser);

export default router;

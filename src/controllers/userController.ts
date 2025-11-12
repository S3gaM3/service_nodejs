import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import { RegisterDto } from '../dto/RegisterDto';
import { LoginDto } from '../dto/LoginDto';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as RegisterDto;
      const result = await this.userService.register(dto);

      res.status(201).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as LoginDto;
      const result = await this.userService.login(dto);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const requesterId = req.user!._id.toString();

      const user = await this.userService.getUserById(id, requesterId);

      res.status(200).json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requesterId = req.user!._id.toString();

      const users = await this.userService.getAllUsers(requesterId);

      res.status(200).json({
        status: 'success',
        data: users,
      });
    } catch (error) {
      next(error);
    }
  };

  blockUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const requesterId = req.user!._id.toString();

      const user = await this.userService.blockUser(id, requesterId);

      res.status(200).json({
        status: 'success',
        data: user,
        message: 'User blocked successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}


import * as bcrypt from 'bcrypt';
import express, { NextFunction, Request, Response } from 'express';
import UserWithThatEmailAlreadyExistsException from '../exceptions/UserWithThatEmailAlreadyExistsException';
import WrongCredentialsException from '../exceptions/WrongCredentialsException';
import Controller from '../interfaces/controller.interface';
import validationMiddleware from '../middleware/validation.middleware';
import CreateUserDto from '../users/users.dto';
import userModel from '../users/users.model';
import LogInDto from './logIn.dto';

class AuthenticationController implements Controller {
  public path = '/auth';

  public router = express.Router();

  private user = userModel;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/register`,
      validationMiddleware(CreateUserDto),
      this.registration,
    );
    this.router.post(
      `${this.path}/login`,
      validationMiddleware(CreateUserDto),
      this.loggingIn,
    );
  }

  private registration = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    const userData: CreateUserDto = request.body;
    const userEmail = await this.user.findOne({ email: userData.email });

    if (userEmail) {
      next(new UserWithThatEmailAlreadyExistsException(userData.email));
    } else {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await this.user.create({
        ...userData,
        password: hashedPassword,
      });
      user.password = '';
      response.send(user);
    }
  };

  private loggingIn = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    const logInData: LogInDto = request.body;
    const user = await this.user.findOne({ email: logInData.email });
    if (user) {
      const isPasswordMatching = await bcrypt.compare(
        logInData.password,
        user.password,
      );
      if (isPasswordMatching) {
        user.password = '';
        response.send(user);
      } else {
        next(new WrongCredentialsException());
      }
    } else {
      next(new WrongCredentialsException());
    }
  };
}

export default AuthenticationController;

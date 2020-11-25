import * as bcrypt from 'bcrypt';
import express, { NextFunction, Request, Response } from 'express';
import IDataStoredInToken from 'interfaces/dataStoredInToken.interface';
import jwt from 'jsonwebtoken';
import UserWithThatEmailAlreadyExistsException from '../exceptions/UserWithThatEmailAlreadyExistsException';
import WrongCredentialsException from '../exceptions/WrongCredentialsException';
import IController from '../interfaces/controller.interface';
import validationMiddleware from '../middleware/validation.middleware';
import CreateUserDto from '../users/users.dto';
import userModel from '../users/users.model';
import LogInDto from './logIn.dto';
import ITokenData from '../interfaces/tokenData.interface';
import IUser from '../users/users.interface';

class AuthenticationController implements IController {
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
    this.router.post(`${this.path}/logout`, this.loggingOut);
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
      const tokenData = this.createToken(user);
      response.setHeader('Set-Cookie', [this.createCookie(tokenData)]);
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
        const tokenData = this.createToken(user);
        response.setHeader('Set-Cokie', [this.createCookie(tokenData)]);
        response.send(user);
      } else {
        next(new WrongCredentialsException());
      }
    } else {
      next(new WrongCredentialsException());
    }
  };

  private createToken(user: IUser): ITokenData {
    const expiresIn = 60 * 60;
    // verificar a necessidade desse operador ternario
    const secret = process.env.JWT_SECRET ? process.env.JWT_SECRET : '';
    const dataStoredInToken: IDataStoredInToken = {
      _id: user._id,
    };
    return {
      expiresIn,
      token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
    };
  }

  private createCookie(tokenData: ITokenData): string {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
  }

  private loggingOut = (request: Request, response: Response): void => {
    response.setHeader('Set-Cookie', ['Authorization=;Max-age=0']);
    response.send(200);
  };
}

export default AuthenticationController;

import * as bcrypt from 'bcrypt';
import express, { NextFunction, Request, Response } from 'express';
import IDataStoredInToken from 'interfaces/dataStoredInToken.interface';
import jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import UserWithThatEmailAlreadyExistsException from '../exceptions/UserWithThatEmailAlreadyExistsException';
import WrongCredentialsException from '../exceptions/WrongCredentialsException';
import IController from '../interfaces/controller.interface';
import validationMiddleware from '../middleware/validation.middleware';
import CreateUserDto from '../users/users.dto';
import UserEntity from '../users/users.entity';
import LogInDto from './logIn.dto';
import ITokenData from '../interfaces/tokenData.interface';

class AuthenticationController implements IController {
  public path = '/auth';

  public router = express.Router();

  private userRepository = getRepository(UserEntity);

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
    const userEmail = await this.userRepository.findOne({
      email: userData.email,
    });

    if (userEmail) {
      next(new UserWithThatEmailAlreadyExistsException(userData.email));
    } else {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      userData.password = hashedPassword;
      const user = this.userRepository.create({ ...userData });
      await this.userRepository.save(user);

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
    const user = await this.userRepository.findOne({ email: logInData.email });
    if (user) {
      const isPasswordMatching = await bcrypt.compare(
        logInData.password,
        user.password,
      );
      if (isPasswordMatching) {
        user.password = '';
        const tokenData = this.createToken(user);
        response.setHeader('Set-Cookie', [this.createCookie(tokenData)]);
        response.send(user);
      } else {
        next(new WrongCredentialsException());
      }
    } else {
      next(new WrongCredentialsException());
    }
  };

  private createToken(user: UserEntity): ITokenData {
    const expiresIn = 60 * 60;
    // verificar a necessidade desse operador ternario
    const secret = process.env.JWT_SECRET ? process.env.JWT_SECRET : '';
    const dataStoredInToken: IDataStoredInToken = {
      id: user.id,
    };
    return {
      expiresIn,
      token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
    };
  }

  private createCookie(tokenData: ITokenData): string {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
  }

  private loggingOut = (request: Request, response: Response) => {
    response.setHeader('Set-Cookie', ['Authorization=;HttpOnly;Max-age=0']);
    response.send(200);
  };
}

export default AuthenticationController;

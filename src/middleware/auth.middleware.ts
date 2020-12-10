import { NextFunction, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import AuthenticationTokenMissingException from '../exceptions/AuthenticationTokenMissingException';
import WrongAuthenticationTokenException from '../exceptions/WrongAuthenticationTokenException';
import IDataStoredInToken from '../interfaces/dataStoredInToken.interface';
import IRequestWithUser from '../interfaces/resquestWithUser.interface';
import UserEntity from '../users/users.entity';

async function authMiddleware(
  request: IRequestWithUser,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const { cookies } = request;
  const userRepository = getRepository(UserEntity);
  if (cookies && cookies.Authorization) {
    const secret = process.env.JWT_SECRET;
    if (secret) {
      try {
        const verificationResponse = jwt.verify(
          cookies.Authorization,
          secret,
        ) as IDataStoredInToken;
        const { id } = verificationResponse;
        const user = await userRepository.findOne(id);
        if (user) {
          request.user = user;
          next();
        } else {
          next(new WrongAuthenticationTokenException());
        }
      } catch (error) {
        next(new WrongAuthenticationTokenException());
      }
    } else {
      next(new AuthenticationTokenMissingException());
    }
  } else {
    next(new AuthenticationTokenMissingException());
  }
}

export default authMiddleware;

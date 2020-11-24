import { NextFunction, RequestHandler, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import AuthenticationTokenMissingException from '../exceptions/AuthenticationTokenMissingException';
import WrongAuthenticationTokenException from '../exceptions/WrongAuthenticationTokenException';
import IDataStoredInToken from '../interfaces/dataStoredInToken.interface';
import IRequestWithUser from '../interfaces/resquestWithUser.interface';
import userModel from '../users/users.model';

async function authMiddleware(
  request: IRequestWithUser,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const { cookies } = request;
  if (cookies && cookies.Authorization) {
    // verificar a necessidade desse operador ternario
    const secret = process.env.JWT_SECRET ? process.env.JWT_SECRET : '';
    try {
      const verificationResponse = jwt.verify(
        cookies.Authorization,
        secret,
      ) as IDataStoredInToken;
      const id = verificationResponse._id;
      const user = await userModel.findById(id);
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
}

export default authMiddleware;

import { Request } from 'express';
import IUser from '../users/users.interface';

interface IRequestWithUser extends Request {
  user?: IUser;
}

export default IRequestWithUser;

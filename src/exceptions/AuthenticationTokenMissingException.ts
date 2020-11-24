import HttpException from './HttpException';

class AuthenticationTokenMissingException extends HttpException {
  constructor() {
    super(401, 'Authentication fails. Please log in again!');
  }
}

export default AuthenticationTokenMissingException;

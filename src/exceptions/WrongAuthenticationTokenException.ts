import HttpException from './HttpException';

class WrongAuthenticationTokenException extends HttpException {
  constructor() {
    super(401, 'Authentication fails. Please log in again!');
  }
}

export default WrongAuthenticationTokenException;

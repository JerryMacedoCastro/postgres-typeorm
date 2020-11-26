import HttpException from './HttpException';

class NotAuthorizationException extends HttpException {
  constructor(message: string) {
    super(400, `Authorization denied \n ${message}`);
  }
}

export default NotAuthorizationException;

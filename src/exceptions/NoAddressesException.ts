import HttpException from './HttpException';

class NoAddressesException extends HttpException {
  constructor() {
    super(400, `No addresses were found`);
  }
}

export default NoAddressesException;

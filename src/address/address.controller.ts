import {
  Request,
  Response,
  Router,
  NextFunction,
  RequestHandler,
} from 'express';
import IController from 'interfaces/controller.interface';
import { getRepository } from 'typeorm';
import AddressEntity from './address.entity';
import NoAddressesException from '../exceptions/NoAddressesException';
import authMiddleware from '../middleware/auth.middleware';

class AddressController implements IController {
  public path = '/address';

  public router = Router();

  private address = getRepository(AddressEntity);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      this.path,
      authMiddleware as RequestHandler,
      this.getAllAddresses,
    );

    this.router.get(
      `${this.path}/user`,
      authMiddleware as RequestHandler,
      this.getAllAddressesByUser,
    );
  }

  private getAllAddresses = async (
    _request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    const addresses = await this.address.find();
    if (addresses) response.send(addresses);
    else next(new NoAddressesException());
  };

  private getAllAddressesByUser = async (
    _request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    const addresses = await this.address.find({ relations: ['user'] });
    if (addresses) response.send(addresses);
    else next(new NoAddressesException());
  };
}

export default AddressController;

import { Router } from 'express';

// eslint-disable-next-line @typescript-eslint/naming-convention
interface Controller {
  path: string;
  router: Router;
}

export default Controller;

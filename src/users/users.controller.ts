import express, {
  NextFunction,
  RequestHandler,
  Router,
  Response,
} from 'express';
import IRequestWithUser from 'interfaces/resquestWithUser.interface';
import postModel from '../posts/posts.model';
import IController from '../interfaces/controller.interface';
import NotAuthorizationException from '../exceptions/NotAuthorizationException';
import authMiddleware from '../middleware/auth.middleware';

class UsersController implements IController {
  public path = '/users';

  public router = Router();

  private post = postModel;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}/:id/posts`,
      authMiddleware as RequestHandler,
      this.getAllPostsOfUser,
    );
  }

  private getAllPostsOfUser = async (
    request: IRequestWithUser,
    response: Response,
    next: NextFunction,
  ) => {
    const userId = request.params.id;

    if (userId.toString() === request.user?._id.toString()) {
      const posts = await this.post.find({ author: userId });
      response.send(posts);
    } else {
      next(new NotAuthorizationException(`${userId} - ${request.user?._id}`));
    }
  };
}

export default UsersController;

import * as express from 'express';
import IRequestWithUser from 'interfaces/resquestWithUser.interface';
import Controller from '../interfaces/controller.interface';
import IPost from './posts.interface';
import postModel from './posts.model';
import CreatePostDto from './posts.dto';
import PostNotFoundException from '../exceptions/PostNotFoundException';
import validationMiddleware from '../middleware/validation.middleware';
import authMiddleware from '../middleware/auth.middleware';

class PostsController implements Controller {
  public path = '/posts';

  public router = express.Router();

  private Post = postModel;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, this.getAllPosts);
    this.router.get(`${this.path}/:id`, this.getPostById);
    this.router
      .all(`${this.path}/*`, authMiddleware as express.RequestHandler)
      .patch(
        `${this.path}/:id`,
        validationMiddleware(CreatePostDto, true),
        this.modifyPost,
      )
      .delete(`${this.path}/:id`, this.deletePost)
      .post(
        this.path,
        authMiddleware as express.RequestHandler,
        validationMiddleware(CreatePostDto),
        this.createPost,
      );
  }

  private getAllPosts = (
    request: express.Request,
    response: express.Response,
  ) => {
    this.Post.find()
      .populate('author', '-password')
      .then(posts => {
        response.send(posts);
      })
      .catch(error => {
        response.send(error.message);
      });
  };

  private getPostById = (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    const { id } = request.params;
    this.Post.findById(id)
      .then(post => {
        response.send(post);
      })
      .catch(_error => next(new PostNotFoundException(id)));
  };

  private modifyPost = (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    const { id } = request.params;
    const postData: IPost = request.body;
    this.Post.findByIdAndUpdate(id, postData, { new: true })
      .then(post => {
        response.send(post);
      })
      .catch(_error => next(new PostNotFoundException(id)));
  };

  private createPost = async (
    request: IRequestWithUser,
    response: express.Response,
  ) => {
    if (request.user) {
      const postData: IPost = request.body;
      const createdPost = new this.Post({
        ...postData,
        author: request.user._id,
      });
      const savedPost = await createdPost.save();
      await savedPost.populate('author', '-password').execPopulate();
      response.send(savedPost);
    }
  };

  private deletePost = (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    const { id } = request.params;
    this.Post.findByIdAndDelete(id)
      .then(() => {
        response.send(200);
      })
      .catch(_error => next(new PostNotFoundException(id)));
  };
}

export default PostsController;

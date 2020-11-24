import * as express from 'express';
import authMiddleware from 'middleware/auth.middleaware';
import Controller from '../interfaces/controller.interface';
import IPost from './posts.interface';
import postModel from './posts.model';
import PostNotFoundException from '../exceptions/PostNotFoundException';
import CreatePostDto from './posts.dto';
import validationMiddleware from '../middleware/validation.middleware';

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
      .all(`${this.path}/*`, authMiddleware)
      .patch(
        `${this.path}/:id`,
        validationMiddleware(CreatePostDto, true),
        this.modifyPost,
      );
    this.router.delete(`${this.path}/:id`, this.deletePost);
    this.router.post(
      this.path,
      validationMiddleware(CreatePostDto),
      this.createPost,
    );
  }

  private getAllPosts = (
    request: express.Request,
    response: express.Response,
  ) => {
    this.Post.find().then(posts => {
      response.send(posts);
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

  private createPost = (
    request: express.Request,
    response: express.Response,
  ) => {
    const postData: IPost = request.body;
    const createdPost = new this.Post(postData);
    createdPost.save().then(savedPost => {
      response.send(savedPost);
    });
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

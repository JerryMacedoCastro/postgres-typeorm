import express, {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from 'express';
import { getRepository } from 'typeorm';
import Controller from '../interfaces/controller.interface';
import IPost from './posts.interface';
import CreatePostDto from './posts.dto';
import PostEntity from './posts.entity';
import PostNotFoundException from '../exceptions/PostNotFoundException';
import validationMiddleware from '../middleware/validation.middleware';
import authMiddleware from '../middleware/auth.middleware';
import IRequestWithUser from '../interfaces/resquestWithUser.interface';

class PostsController implements Controller {
  public path = '/posts';

  public router = express.Router();

  private postRepository = getRepository(PostEntity);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, this.getAllPosts);
    this.router.get(`${this.path}/:id`, this.getPostById);
    this.router
      .all(`${this.path}/*`, authMiddleware as RequestHandler)
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

  private getAllPosts = async (_request: Request, response: Response) => {
    const posts = await this.postRepository.find({ relations: ['categories'] });
    response.send(posts);
  };

  private getPostById = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    const { id } = request.params;
    const post = await this.postRepository.findOne(id, {
      relations: ['categories'],
    });
    if (post) response.send(post);
    else next(new PostNotFoundException(id));
  };

  private modifyPost = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    const { id } = request.params;
    const postData: IPost = request.body;
    await this.postRepository.update(id, postData);
    const updatedPost = await this.postRepository.findOne(id);
    if (updatedPost) response.send(updatedPost);
    else next(new PostNotFoundException(id));
  };

  private createPost = async (
    request: IRequestWithUser,
    response: Response,
  ) => {
    const postData: CreatePostDto = request.body;
    const newPost = this.postRepository.create({
      ...postData,
      author: request.user,
    });
    await this.postRepository.save(newPost);
    response.send(newPost);
  };

  private deletePost = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    const { id } = request.params;
    const deleteResponse = await this.postRepository.delete(id);
    if (deleteResponse.raw[1]) response.status(200).send();
    else next(new PostNotFoundException(id));
  };
}

export default PostsController;

import * as express from 'express';
import Controller from '../interfaces/controller.interface';
import Post from './posts.interface';
import postModel from './posts.model';

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
    this.router.patch(`${this.path}/:id`, this.modifyPost);
    this.router.delete(`${this.path}/:id`, this.deletePost);
    this.router.post(this.path, this.createPost);
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
  ) => {
    const { id } = request.params;
    this.Post.findById(id).then(post => {
      response.send(post);
    });
  };

  private modifyPost = (
    request: express.Request,
    response: express.Response,
  ) => {
    const { id } = request.params;
    const postData: Post = request.body;
    this.Post.findByIdAndUpdate(id, postData, { new: true }).then(post => {
      response.send(post);
    });
  };

  private createPost = (
    request: express.Request,
    response: express.Response,
  ) => {
    const postData: Post = request.body;
    const createdPost = new this.Post(postData);
    createdPost.save().then(savedPost => {
      response.send(savedPost);
    });
  };

  private deletePost = (
    request: express.Request,
    response: express.Response,
  ) => {
    const { id } = request.params;
    this.Post.findByIdAndDelete(id).then(successResponse => {
      if (successResponse) {
        response.send(200);
      } else {
        response.send(404);
      }
    });
  };
}

export default PostsController;

import 'dotenv/config';
import App from './app';
import PostsController from './posts/posts.controller';
import UsersController from './users/users.controller';
import AuthenticationController from './authentication/authentication.controller';
import validateEnv from './utils/validateEnv';

validateEnv();

const app = new App([
  new PostsController(),
  new AuthenticationController(),
  new UsersController(),
]);

app.listen();

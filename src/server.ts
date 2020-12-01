import 'dotenv/config';
import { createConnection } from 'typeorm';
import config from './ormconfig';
import App from './app';
import PostsController from './posts/posts.controller';
import UsersController from './users/users.controller';
import AuthenticationController from './authentication/authentication.controller';
import validateEnv from './utils/validateEnv';

validateEnv();

(async () => {
  try {
    await createConnection(config);
  } catch (error) {
    console.log('Error while connecting to the database');
  }
  const app = new App([
    new PostsController(),
    new AuthenticationController(),
    new UsersController(),
  ]);

  app.listen();
})();

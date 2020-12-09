import express, { Response, Request, RequestHandler } from 'express';
import IController from 'interfaces/controller.interface';
import validationMiddleware from 'middleware/validation.middleware';
import { getRepository, ObjectID } from 'typeorm';
import authMiddleware from 'middleware/auth.middleware';
import Category from './category.entity';
import CreateCategoryDto from './category.dto';

class CategoryController implements IController {
  public path = '/categories';

  public router = express.Router();

  private CategoryRepository = getRepository(Category);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, this.getAllcategories);
    this.router.get(`${this.path}/:id`, this.getCategoryById);
    this.router.post(
      this.path,
      authMiddleware as express.RequestHandler,
      validationMiddleware(CreateCategoryDto),
      this.createCategory,
    );
  }

  private createCategory = async (request: Request, response: Response) => {
    const category = request.body;
    const newCategory = this.CategoryRepository.create(category);

    await this.CategoryRepository.save(newCategory);

    response.send(newCategory);
  };

  private getCategoryById = async (request: Request, response: Response) => {
    const categoryId = request.params.id;
    const category = this.CategoryRepository.findOne(categoryId, {
      relations: ['posts'],
    });

    response.send(category);
  };

  private getAllcategories = async (_request: Request, response: Response) => {
    const categories = this.CategoryRepository.find({ relations: ['posts'] });
    response.send(categories);
  };
}

export default CategoryController;

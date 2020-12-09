import express, { Response, Request, NextFunction } from 'express';
import IController from 'interfaces/controller.interface';
import { getRepository } from 'typeorm';
import Category from './category.entity';
import CreateCategoryDto from './category.dto';
import validationMiddleware from '../middleware/validation.middleware';
import authMiddleware from '../middleware/auth.middleware';
import CategoryNotFoundException from '../exceptions/CategoryNotFoundException';

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

  private getCategoryById = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    const categoryId = request.params.id;
    const category = await this.CategoryRepository.findOne(categoryId, {
      relations: ['posts'],
    });
    if (category) {
      response.send(category);
    } else {
      next(new CategoryNotFoundException(categoryId));
    }

    response.send(category);
  };

  private getAllcategories = async (_request: Request, response: Response) => {
    const categories = await this.CategoryRepository.find({
      relations: ['posts'],
    });
    response.send(categories);
  };
}

export default CategoryController;

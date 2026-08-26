import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/category.service.js';
import { sendSuccess } from '../utils/response.js';

const categoryService = new CategoryService();

export async function getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await categoryService.getAllCategories();
    sendSuccess(res, categories, 'Categories retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getCategoryBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slug } = req.params;
    const category = await categoryService.getCategoryBySlug(slug);
    sendSuccess(res, category, 'Category details retrieved');
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const category = await categoryService.createCategory(req.body);
    sendSuccess(res, category, 'Category created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const category = await categoryService.updateCategory(id, req.body);
    sendSuccess(res, category, 'Category updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await categoryService.deleteCategory(id);
    sendSuccess(res, null, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
}

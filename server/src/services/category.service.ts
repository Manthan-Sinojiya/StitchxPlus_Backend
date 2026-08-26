import { CategoryRepository } from '../repositories/category.repository.js';
import { ICategoryDocument } from '../models/category.model.js';
import { ProductModel } from '../models/product.model.js';
import { AppError } from '../utils/appError.js';

export class CategoryService {
  constructor(private categoryRepository: CategoryRepository = new CategoryRepository()) {}

  public async getAllCategories(): Promise<ICategoryDocument[]> {
    return this.categoryRepository.find({ isActive: true });
  }

  public async getCategoryBySlug(slug: string): Promise<ICategoryDocument> {
    const category = await this.categoryRepository.findBySlug(slug);
    if (!category || !category.isActive) {
      throw new AppError(`Category with slug '${slug}' not found`, 404);
    }
    return category;
  }

  public async createCategory(data: Partial<ICategoryDocument>): Promise<ICategoryDocument> {
    if (!data.name) {
      throw new AppError('Category name is required', 400);
    }

    if (!data.slug) {
      data.slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    const existing = await this.categoryRepository.findBySlug(data.slug);
    if (existing) {
      throw new AppError(`Category with slug '${data.slug}' already exists`, 400);
    }

    return this.categoryRepository.create(data);
  }

  public async updateCategory(
    id: string,
    data: Partial<ICategoryDocument>,
  ): Promise<ICategoryDocument> {
    const existing = await this.categoryRepository.findById(id);
    if (!existing) {
      throw new AppError(`Category with ID '${id}' not found`, 404);
    }

    if (data.slug && data.slug !== existing.slug) {
      const existingSlug = await this.categoryRepository.findBySlug(data.slug);
      if (existingSlug && existingSlug._id.toString() !== id) {
        throw new AppError(`Category with slug '${data.slug}' already exists`, 400);
      }
    }

    if (data.isActive === false) {
      const assignedProductsCount = await ProductModel.countDocuments({
        $or: [{ category: id }, { categories: id }],
      });
      if (assignedProductsCount > 0) {
        throw new AppError(
          `Cannot deactivate category '${existing.name}': ${assignedProductsCount} product(s) are currently assigned to it.`,
          400,
        );
      }
    }

    const updated = await this.categoryRepository.updateById(id, data);
    if (!updated) {
      throw new AppError('Failed to update category', 500);
    }
    return updated;
  }

  public async deleteCategory(id: string): Promise<boolean> {
    const existing = await this.categoryRepository.findById(id);
    if (!existing) {
      throw new AppError(`Category with ID '${id}' not found`, 404);
    }

    const assignedProductsCount = await ProductModel.countDocuments({
      $or: [{ category: id }, { categories: id }],
    });
    if (assignedProductsCount > 0) {
      throw new AppError(
        `Cannot delete category '${existing.name}': ${assignedProductsCount} product(s) are currently assigned to it. Please reassign or remove the products first.`,
        400,
      );
    }

    const result = await this.categoryRepository.deleteById(id);
    return !!result;
  }
}

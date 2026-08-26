import { ProductRepository, ProductQueryFilter } from '../repositories/product.repository.js';
import { CategoryRepository } from '../repositories/category.repository.js';
import { IProductDocument } from '../models/product.model.js';
import { AppError } from '../utils/appError.js';

export class ProductService {
  constructor(
    private productRepository: ProductRepository = new ProductRepository(),
    private categoryRepository: CategoryRepository = new CategoryRepository(),
  ) {}

  public async getProducts(queryParams: ProductQueryFilter) {
    return this.productRepository.findPaginated(queryParams);
  }

  public async getProductBySlug(slug: string): Promise<IProductDocument> {
    let product: IProductDocument | null = null;
    if (slug.match(/^[0-9a-fA-F]{24}$/)) {
      product = await this.productRepository.findById(slug);
    }
    if (!product) {
      product = await this.productRepository.findBySlug(slug);
    }
    if (!product) {
      throw new AppError(`Product with identifier '${slug}' not found`, 404);
    }
    return product;
  }

  public async getRelatedProducts(idOrSlug: string, limit = 4): Promise<IProductDocument[]> {
    let product: IProductDocument | null = null;
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      product = await this.productRepository.findById(idOrSlug);
    }
    if (!product) {
      product = await this.productRepository.findBySlug(idOrSlug);
    }
    if (!product) {
      throw new AppError(`Product '${idOrSlug}' not found`, 404);
    }

    return this.productRepository.findRelated(product, limit);
  }

  public async createProduct(data: Partial<IProductDocument>): Promise<IProductDocument> {
    if (!data.name || !data.category || data.basePrice === undefined) {
      throw new AppError('Name, category, and base price are required', 400);
    }

    if (data.slug) {
      const existingSlug = await this.productRepository.findBySlug(data.slug);
      if (existingSlug) {
        throw new AppError(`Product with slug '${data.slug}' already exists`, 400);
      }
    } else {
      data.slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    if (data.sku) {
      const existingSku = await this.productRepository.findBySku(data.sku);
      if (existingSku) {
        throw new AppError(`Product with SKU '${data.sku}' already exists`, 400);
      }
    } else {
      data.sku = `STX-${Date.now().toString(36).toUpperCase()}`;
    }

    const categoryObj = await this.categoryRepository.findById(data.category.toString());
    if (!categoryObj) {
      throw new AppError('Specified category does not exist', 400);
    }

    return this.productRepository.create(data);
  }

  public async updateProduct(
    id: string,
    data: Partial<IProductDocument>,
  ): Promise<IProductDocument> {
    const existing = await this.productRepository.findById(id);
    if (!existing) {
      throw new AppError(`Product with ID '${id}' not found`, 404);
    }

    if (data.slug && data.slug !== existing.slug) {
      const existingSlug = await this.productRepository.findBySlug(data.slug);
      if (existingSlug) {
        throw new AppError(`Product with slug '${data.slug}' already exists`, 400);
      }
    }

    const updated = await this.productRepository.updateById(id, data);
    if (!updated) {
      throw new AppError('Failed to update product', 500);
    }
    return updated;
  }

  public async deleteProduct(id: string): Promise<boolean> {
    const existing = await this.productRepository.findById(id);
    if (!existing) {
      throw new AppError(`Product with ID '${id}' not found`, 404);
    }
    const result = await this.productRepository.deleteById(id);
    return !!result;
  }
}

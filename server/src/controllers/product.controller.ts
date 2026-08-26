import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service.js';
import { sendSuccess } from '../utils/response.js';

const productService = new ProductService();

export async function getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { category, fabric, color, priceMin, priceMax, sort, search, page, limit } = req.query;

    const result = await productService.getProducts({
      category: category ? String(category) : undefined,
      fabric: fabric ? String(fabric) : undefined,
      color: color ? String(color) : undefined,
      priceMin: priceMin !== undefined ? Number(priceMin) : undefined,
      priceMax: priceMax !== undefined ? Number(priceMax) : undefined,
      sort: sort as any,
      search: search ? String(search) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 12,
    });

    sendSuccess(res, result, 'Products retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getProductBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slug } = req.params;
    const product = await productService.getProductBySlug(slug);
    sendSuccess(res, product, 'Product details retrieved');
  } catch (error) {
    next(error);
  }
}

export async function getRelatedProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const related = await productService.getRelatedProducts(id);
    sendSuccess(res, related, 'Related products retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await productService.createProduct(req.body);
    sendSuccess(res, product, 'Product created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const product = await productService.updateProduct(id, req.body);
    sendSuccess(res, product, 'Product updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await productService.deleteProduct(id);
    sendSuccess(res, null, 'Product deleted successfully');
  } catch (error) {
    next(error);
  }
}

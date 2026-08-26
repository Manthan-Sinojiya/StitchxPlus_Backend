import { FilterQuery } from 'mongoose';
import { BaseRepository } from './base.repository.js';
import { ProductModel, IProductDocument } from '../models/product.model.js';
import { CategoryModel } from '../models/category.model.js';
import '../models/fabric.model.js';

export interface ProductQueryFilter {
  category?: string;
  fabric?: string;
  color?: string;
  priceMin?: number;
  priceMax?: number;
  search?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating';
  page?: number;
  limit?: number;
}

export class ProductRepository extends BaseRepository<IProductDocument> {
  constructor() {
    super(ProductModel);
  }

  public async findBySlug(slug: string): Promise<IProductDocument | null> {
    return ProductModel.findOne({ slug: slug.toLowerCase().trim() })
      .populate('category')
      .populate('availableFabrics')
      .exec();
  }

  public async findBySku(sku: string): Promise<IProductDocument | null> {
    return ProductModel.findOne({ sku: sku.toUpperCase().trim() })
      .populate('category')
      .populate('availableFabrics')
      .exec();
  }

  public async findByCategory(categoryId: string): Promise<IProductDocument[]> {
    return ProductModel.find({ category: categoryId })
      .populate('category')
      .populate('availableFabrics')
      .exec();
  }

  public async findRelated(product: IProductDocument, limit = 4): Promise<IProductDocument[]> {
    const categoryId =
      typeof product.category === 'object' && product.category
        ? (product.category as any)._id || product.category
        : product.category;

    const fabricIds = (product.availableFabrics || []).map((f: any) =>
      typeof f === 'object' && f ? f._id || f : f,
    );

    const filter: FilterQuery<IProductDocument> = {
      _id: { $ne: product._id },
      $or: [{ category: categoryId }, { availableFabrics: { $in: fabricIds } }],
    };

    return ProductModel.find(filter)
      .limit(limit)
      .populate('category')
      .populate('availableFabrics')
      .exec();
  }

  public async findPaginated(queryParams: ProductQueryFilter) {
    const page = Math.max(1, Number(queryParams.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(queryParams.limit) || 12));
    const skip = (page - 1) * limit;

    const mongoFilter: FilterQuery<IProductDocument> = {};

    // Filter by Category (can be ObjectId or Category slug)
    if (queryParams.category) {
      if (queryParams.category.match(/^[0-9a-fA-F]{24}$/)) {
        mongoFilter.category = queryParams.category;
      } else {
        const cat = await CategoryModel.findOne({ slug: queryParams.category.toLowerCase() });
        if (cat) {
          mongoFilter.category = cat._id;
        } else {
          mongoFilter.category = null;
        }
      }
    }

    // Filter by Fabric (ObjectId)
    if (queryParams.fabric) {
      mongoFilter.availableFabrics = queryParams.fabric;
    }

    // Filter by Color
    if (queryParams.color) {
      mongoFilter.colors = { $in: [new RegExp(`^${queryParams.color}$`, 'i')] };
    }

    // Filter by Price Range
    if (queryParams.priceMin !== undefined || queryParams.priceMax !== undefined) {
      mongoFilter.basePrice = {};
      if (queryParams.priceMin !== undefined && !isNaN(queryParams.priceMin)) {
        mongoFilter.basePrice.$gte = queryParams.priceMin;
      }
      if (queryParams.priceMax !== undefined && !isNaN(queryParams.priceMax)) {
        mongoFilter.basePrice.$lte = queryParams.priceMax;
      }
    }

    // Search query matching name, description, tags, or sku
    if (queryParams.search && queryParams.search.trim()) {
      const term = queryParams.search.trim();
      const regex = new RegExp(term, 'i');
      mongoFilter.$or = [{ name: regex }, { description: regex }, { tags: { $in: [regex] } }, { sku: regex }];
    }

    // Sorting
    let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
    if (queryParams.sort === 'price_asc') {
      sortOptions = { basePrice: 1 };
    } else if (queryParams.sort === 'price_desc') {
      sortOptions = { basePrice: -1 };
    } else if (queryParams.sort === 'rating') {
      sortOptions = { rating: -1, numReviews: -1 };
    } else if (queryParams.sort === 'newest') {
      sortOptions = { createdAt: -1 };
    }

    const [products, total] = await Promise.all([
      ProductModel.find(mongoFilter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('category')
        .populate('availableFabrics')
        .exec(),
      ProductModel.countDocuments(mongoFilter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }
}

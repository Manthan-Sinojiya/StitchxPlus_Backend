import { BaseRepository } from './base.repository.js';
import { CategoryModel, ICategoryDocument } from '../models/category.model.js';

export class CategoryRepository extends BaseRepository<ICategoryDocument> {
  constructor() {
    super(CategoryModel);
  }

  public async findBySlug(slug: string): Promise<ICategoryDocument | null> {
    return this.findOne({ slug: slug.toLowerCase().trim() });
  }

  public async findAllWithParent(filter: any = {}): Promise<ICategoryDocument[]> {
    return this.model.find(filter).populate('parentCategory').exec();
  }
}

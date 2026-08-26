import { BaseRepository } from './base.repository.js';
import { ReviewModel, IReviewDocument } from '../models/review.model.js';

export class ReviewRepository extends BaseRepository<IReviewDocument> {
  constructor() {
    super(ReviewModel);
  }

  public async findByProductId(productId: string): Promise<IReviewDocument[]> {
    return this.find({ productId });
  }
}

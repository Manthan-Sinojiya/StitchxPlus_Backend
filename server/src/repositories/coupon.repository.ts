import { BaseRepository } from './base.repository.js';
import { CouponModel, ICouponDocument } from '../models/coupon.model.js';

export class CouponRepository extends BaseRepository<ICouponDocument> {
  constructor() {
    super(CouponModel);
  }

  public async findByCode(code: string): Promise<ICouponDocument | null> {
    return this.findOne({ code: code.toUpperCase().trim() });
  }
}

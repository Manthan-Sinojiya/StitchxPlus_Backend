import { BaseRepository } from './base.repository.js';
import { OrderModel, IOrderDocument } from '../models/order.model.js';

export class OrderRepository extends BaseRepository<IOrderDocument> {
  constructor() {
    super(OrderModel);
  }

  public async findByOrderNumber(orderNumber: string): Promise<IOrderDocument | null> {
    return this.findOne({ orderNumber: orderNumber.toUpperCase().trim() });
  }

  public async findByUserId(userId: string): Promise<IOrderDocument[]> {
    return this.find({ userId });
  }
}

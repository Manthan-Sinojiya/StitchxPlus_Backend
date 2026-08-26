import { BaseRepository } from './base.repository.js';
import { AddressModel, IAddressDocument } from '../models/address.model.js';

export class AddressRepository extends BaseRepository<IAddressDocument> {
  constructor() {
    super(AddressModel);
  }

  public async findByUserId(userId: string): Promise<IAddressDocument[]> {
    return this.find({ userId });
  }
}

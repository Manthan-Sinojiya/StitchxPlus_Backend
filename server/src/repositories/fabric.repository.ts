import { BaseRepository } from './base.repository.js';
import { FabricModel, IFabricDocument } from '../models/fabric.model.js';

export class FabricRepository extends BaseRepository<IFabricDocument> {
  constructor() {
    super(FabricModel);
  }

  public async findByCode(code: string): Promise<IFabricDocument | null> {
    return this.findOne({ code: code.toUpperCase().trim() });
  }
}

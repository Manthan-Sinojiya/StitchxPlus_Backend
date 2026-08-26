import { BaseRepository } from './base.repository.js';
import {
  CustomizationOptionModel,
  ICustomizationOptionDocument,
} from '../models/customizationOption.model.js';

export class CustomizationOptionRepository extends BaseRepository<ICustomizationOptionDocument> {
  constructor() {
    super(CustomizationOptionModel);
  }

  public async findByType(type: string): Promise<ICustomizationOptionDocument[]> {
    return this.find({ type });
  }
}

import { BaseRepository } from './base.repository.js';
import {
  MeasurementProfileModel,
  IMeasurementProfileDocument,
} from '../models/measurementProfile.model.js';

export class MeasurementProfileRepository extends BaseRepository<IMeasurementProfileDocument> {
  constructor() {
    super(MeasurementProfileModel);
  }

  public async findByUserId(userId: string): Promise<IMeasurementProfileDocument[]> {
    return this.find({ userId });
  }
}

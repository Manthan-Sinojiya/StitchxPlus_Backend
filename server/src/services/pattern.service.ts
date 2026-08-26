import { PatternRepository } from '../repositories/pattern.repository.js';
import { AppError } from '../utils/appError.js';
import { IMeasurementProfileDocument } from '../models/measurementProfile.model.js';

export class PatternService {
  private patternRepository: PatternRepository;

  constructor() {
    this.patternRepository = new PatternRepository();
  }

  async createPattern(
    userId: string,
    data: Partial<IMeasurementProfileDocument>,
  ): Promise<IMeasurementProfileDocument> {
    return this.patternRepository.createPattern(userId, data);
  }

  async getUserPatterns(userId: string): Promise<IMeasurementProfileDocument[]> {
    return this.patternRepository.getPatternsByUser(userId);
  }

  async getPatternById(id: string, userId: string): Promise<IMeasurementProfileDocument> {
    const pattern = await this.patternRepository.getPatternById(id, userId);
    if (!pattern) {
      throw new AppError('Measurement profile not found or unauthorized', 404);
    }
    return pattern;
  }

  async updatePattern(
    id: string,
    userId: string,
    data: Partial<IMeasurementProfileDocument>,
  ): Promise<IMeasurementProfileDocument> {
    const updated = await this.patternRepository.updatePattern(id, userId, data);
    if (!updated) {
      throw new AppError('Measurement profile not found or unauthorized', 404);
    }
    return updated;
  }

  async deletePattern(id: string, userId: string): Promise<void> {
    const deleted = await this.patternRepository.deletePattern(id, userId);
    if (!deleted) {
      throw new AppError('Measurement profile not found or unauthorized', 404);
    }
  }

  async duplicatePattern(id: string, userId: string): Promise<IMeasurementProfileDocument> {
    const duplicate = await this.patternRepository.duplicatePattern(id, userId);
    if (!duplicate) {
      throw new AppError('Measurement profile not found or unauthorized', 404);
    }
    return duplicate;
  }

  async setDefaultPattern(id: string, userId: string): Promise<IMeasurementProfileDocument> {
    const updated = await this.patternRepository.setDefaultPattern(id, userId);
    if (!updated) {
      throw new AppError('Measurement profile not found or unauthorized', 404);
    }
    return updated;
  }
}

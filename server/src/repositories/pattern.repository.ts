import { MeasurementProfileModel, IMeasurementProfileDocument } from '../models/measurementProfile.model.js';
import { Types } from 'mongoose';

export class PatternRepository {
  async createPattern(
    userId: string,
    data: Partial<IMeasurementProfileDocument>,
  ): Promise<IMeasurementProfileDocument> {
    if (data.isDefault) {
      await MeasurementProfileModel.updateMany({ userId }, { isDefault: false });
    } else {
      // If user has no existing patterns, set this first pattern as default
      const existingCount = await MeasurementProfileModel.countDocuments({ userId });
      if (existingCount === 0) {
        data.isDefault = true;
      }
    }

    const newPattern = new MeasurementProfileModel({
      ...data,
      userId: new Types.ObjectId(userId),
    });

    return newPattern.save();
  }

  async getPatternsByUser(userId: string): Promise<IMeasurementProfileDocument[]> {
    return MeasurementProfileModel.find({ userId }).sort({ isDefault: -1, createdAt: -1 }).exec();
  }

  async getPatternById(id: string, userId: string): Promise<IMeasurementProfileDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return MeasurementProfileModel.findOne({ _id: id, userId }).exec();
  }

  async updatePattern(
    id: string,
    userId: string,
    data: Partial<IMeasurementProfileDocument>,
  ): Promise<IMeasurementProfileDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    if (data.isDefault) {
      await MeasurementProfileModel.updateMany({ userId }, { isDefault: false });
    }

    return MeasurementProfileModel.findOneAndUpdate({ _id: id, userId }, data, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async deletePattern(id: string, userId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await MeasurementProfileModel.deleteOne({ _id: id, userId }).exec();
    return result.deletedCount > 0;
  }

  async duplicatePattern(id: string, userId: string): Promise<IMeasurementProfileDocument | null> {
    const original = await this.getPatternById(id, userId);
    if (!original) return null;

    const copyObj = original.toObject();
    delete copyObj._id;
    delete (copyObj as any).createdAt;
    delete (copyObj as any).updatedAt;
    delete (copyObj as any).id;

    copyObj.name = `Copy of ${original.name}`;
    copyObj.isDefault = false;
    copyObj.userId = new Types.ObjectId(userId);

    const duplicate = new MeasurementProfileModel(copyObj);
    return duplicate.save();
  }

  async setDefaultPattern(id: string, userId: string): Promise<IMeasurementProfileDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    await MeasurementProfileModel.updateMany({ userId }, { isDefault: false });

    return MeasurementProfileModel.findOneAndUpdate(
      { _id: id, userId },
      { isDefault: true },
      { new: true },
    ).exec();
  }
}

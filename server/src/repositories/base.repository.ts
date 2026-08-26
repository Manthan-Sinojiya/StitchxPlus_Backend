import { Model, Document, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';

/**
 * Generic Base Repository class providing standard CRUD data operations for Mongoose models.
 * Other entity repositories extend this class.
 */
export abstract class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  public async create(data: Partial<T>): Promise<T> {
    const entity = new this.model(data);
    return (await entity.save()) as T;
  }

  public async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  public async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  public async find(filter: FilterQuery<T> = {}, options: QueryOptions = {}): Promise<T[]> {
    return this.model.find(filter, null, options).exec();
  }

  public async findAll(filter: FilterQuery<T> = {}, options: QueryOptions = {}): Promise<T[]> {
    return this.find(filter, options);
  }

  public async updateById(id: string, update: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, update, { new: true, runValidators: true }).exec();
  }

  public async deleteById(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  public async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }
}

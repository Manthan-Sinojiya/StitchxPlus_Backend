import { BaseRepository } from './base.repository.js';
import { UserModel, IUserDocument } from '../models/user.model.js';

export class UserRepository extends BaseRepository<IUserDocument> {
  constructor() {
    super(UserModel);
  }

  public async findByEmail(email: string): Promise<IUserDocument | null> {
    return this.findOne({ email: email.toLowerCase().trim() });
  }
}

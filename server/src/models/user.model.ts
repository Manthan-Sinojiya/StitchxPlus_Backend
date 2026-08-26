import { Schema, model, Document } from 'mongoose';

export type UserRole = 'CUSTOMER' | 'ADMIN' | 'STAFF';

export interface IUserAddress {
  _id?: string;
  id?: string;
  label?: string;
  firstName: string;
  lastName: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface IWishlistItem {
  productId: Schema.Types.ObjectId | string;
  addedAt: Date;
}

export interface IUserDocument extends Document {
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  phone?: string;
  isVerified: boolean;
  addresses: IUserAddress[];
  wishlist: IWishlistItem[];
  refreshTokens: string[];
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordTokenExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IUserAddress>(
  {
    label: { type: String, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    apartment: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true, timestamps: false },
);

const wishlistSchema = new Schema<IWishlistItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const userSchema = new Schema<IUserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, select: false },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['CUSTOMER', 'ADMIN', 'STAFF'], default: 'CUSTOMER' },
    phone: { type: String, trim: true },
    isVerified: { type: Boolean, default: false },
    addresses: [addressSchema],
    wishlist: [wishlistSchema],
    refreshTokens: [{ type: String, select: false }],
    verificationToken: { type: String, select: false },
    verificationTokenExpires: { type: Date, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordTokenExpires: { type: Date, select: false },
  },
  {
    timestamps: true,
  },
);

export const UserModel = model<IUserDocument>('User', userSchema);

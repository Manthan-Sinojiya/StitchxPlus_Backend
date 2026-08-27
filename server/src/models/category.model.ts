import { Schema, model, Document, Types } from 'mongoose';

export interface ICategoryDocument extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentCategory?: Types.ObjectId;
  isTopLevel?: boolean;
  type?: 'department' | 'category';
  sortOrder?: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategoryDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, trim: true },
    image: { type: String },
    parentCategory: { type: Schema.Types.ObjectId, ref: 'Category', default: null, index: true },
    isTopLevel: { type: Boolean, default: false, index: true },
    type: { type: String, enum: ['department', 'category'], default: 'category', index: true },
    sortOrder: { type: Number, default: 0 },
    seo: {
      metaTitle: { type: String, trim: true },
      metaDescription: { type: String, trim: true },
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete (ret as Record<string, unknown>)._id;
        delete (ret as Record<string, unknown>).__v;
        return ret;
      },
    },
  },
);

export const CategoryModel = model<ICategoryDocument>('Category', categorySchema);

import { Schema, model, Document } from 'mongoose';

export interface IPageDocument extends Document {
  title: string;
  slug: string;
  body: string; // Rich text / HTML
  selectedProducts?: string[];
  seo: {
    title?: string;
    description?: string;
  };
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

const pageSchema = new Schema<IPageDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    body: { type: String, required: true, default: '' },
    selectedProducts: [{ type: String }],
    seo: {
      title: { type: String, trim: true },
      description: { type: String, trim: true },
    },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
  },
  {
    timestamps: true,
  },
);

export const PageModel = model<IPageDocument>('Page', pageSchema);

import { Schema, model, Document } from 'mongoose';

export interface ISiteContentDocument extends Document {
  key: 'home' | 'nav' | 'footer' | 'announcement' | 'faq' | 'settings';
  data: Record<string, any>;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

const siteContentSchema = new Schema<ISiteContentDocument>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      enum: ['home', 'nav', 'footer', 'announcement', 'faq', 'settings'],
      index: true,
    },
    data: { type: Schema.Types.Mixed, required: true, default: {} },
    status: { type: String, enum: ['draft', 'published'], default: 'published', index: true },
  },
  {
    timestamps: true,
  },
);

export const SiteContentModel = model<ISiteContentDocument>('SiteContent', siteContentSchema);

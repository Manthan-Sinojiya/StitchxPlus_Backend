import mongoose, { Schema, Document } from 'mongoose';

export interface IBlogDocument extends Document {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  image?: string;
  author?: string;
  category?: string;
  tags?: string[];
  readTime?: string;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlogDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, trim: true },
    content: { type: String, required: true },
    image: { type: String, default: '' },
    author: { type: String, default: 'Stitchx Plus Atelier' },
    category: { type: String, default: 'Style & Heritage' },
    tags: [{ type: String, trim: true }],
    readTime: { type: String, default: '5 min read' },
    isPublished: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

blogSchema.index({ slug: 1 });
blogSchema.index({ isPublished: 1, publishedAt: -1 });

export const BlogModel = mongoose.model<IBlogDocument>('Blog', blogSchema);

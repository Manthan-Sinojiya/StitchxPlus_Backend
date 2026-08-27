import { Schema, model, Document, Types } from 'mongoose';

export interface IProductDocument extends Document {
  name: string;
  slug: string;
  sku: string;
  shortDescription?: string;
  description: string;
  basePrice: number;
  compareAtPrice?: number;
  currency?: string;
  images: any[];
  category: Types.ObjectId;
  categories?: Types.ObjectId[];
  collections?: string[];
  fabricRef?: Types.ObjectId;
  availableFabrics?: Types.ObjectId[];
  customizationOptions?: Types.ObjectId[];
  customizationGroups?: string[];
  customizationRules?: Array<{ groupCode: string; allowedOptionCodes?: string[] }>;
  fitType?: string;
  isCustomizable?: boolean;
  sizes?: string[];
  simpleVariants?: Array<{ name?: string; colorName?: string; sizeName?: string; sku?: string; stockQuantity?: number; inStock?: boolean }>;
  colors?: any[];
  tags?: string[];
  inStock: boolean;
  isMadeToOrder?: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
  status?: 'draft' | 'active' | 'out_of_stock' | 'archived';
  isFeatured: boolean;
  isNew: boolean;
  isOnSale?: boolean;
  rating: number;
  numReviews: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalSlug?: string;
  };
  shipping?: {
    weight?: number;
    dimensions?: { length?: number; width?: number; height?: number };
    shippingClass?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    shortDescription: { type: String, trim: true },
    description: { type: String, required: true },
    basePrice: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    currency: { type: String, default: 'USD' },
    images: [{ type: Schema.Types.Mixed }],
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    collections: [{ type: String, trim: true }],
    fabricRef: { type: Schema.Types.ObjectId, ref: 'Fabric' },
    availableFabrics: [{ type: Schema.Types.ObjectId, ref: 'Fabric' }],
    customizationOptions: [{ type: Schema.Types.ObjectId, ref: 'CustomizationOption' }],
    customizationGroups: [{ type: String }],
    customizationRules: [
      {
        groupCode: { type: String, required: true },
        allowedOptionCodes: [{ type: String }],
      },
    ],
    fitType: { type: String, trim: true, default: 'Tailored Fit' },
    isCustomizable: { type: Boolean, default: true },
    sizes: [{ type: String, trim: true }],
    simpleVariants: [
      {
        name: { type: String },
        colorName: { type: String },
        sizeName: { type: String },
        sku: { type: String },
        stockQuantity: { type: Number, default: 0 },
        inStock: { type: Boolean, default: true },
      },
    ],
    colors: [{ type: Schema.Types.Mixed }],
    tags: [{ type: String, lowercase: true, trim: true }],
    inStock: { type: Boolean, default: true },
    isMadeToOrder: { type: Boolean, default: true },
    stockQuantity: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    status: {
      type: String,
      enum: ['draft', 'active', 'out_of_stock', 'archived'],
      default: 'active',
      index: true,
    },
    isFeatured: { type: Boolean, default: false },
    isNew: { type: Boolean, default: false },
    isOnSale: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0, min: 0 },
    seo: {
      metaTitle: { type: String, trim: true },
      metaDescription: { type: String, trim: true },
      canonicalSlug: { type: String, trim: true },
    },
    shipping: {
      weight: { type: Number },
      dimensions: {
        length: { type: Number },
        width: { type: Number },
        height: { type: Number },
      },
      shippingClass: { type: String, trim: true },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc: any, ret: any) {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Create text index for search & performance compound indexes
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, inStock: 1 });
productSchema.index({ isFeatured: -1, createdAt: -1 });

export const ProductModel = model<IProductDocument>('Product', productSchema as any);

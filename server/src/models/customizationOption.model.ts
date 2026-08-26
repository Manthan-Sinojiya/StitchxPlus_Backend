import { Schema, model, Document } from 'mongoose';

export interface ISingleCustomizationOption {
  code: string;
  name: string;
  priceAdjustment: number;
  image?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
  incompatibleWith?: string[];
}

export interface ICustomizationOptionDocument extends Document {
  group: string;
  groupCode: string;
  isRequired: boolean;
  sortOrder: number;
  compatibleProductTypes: string[];
  applicableCategories?: string[];
  options: ISingleCustomizationOption[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const singleCustomizationOptionSchema = new Schema<ISingleCustomizationOption>({
  code: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  priceAdjustment: { type: Number, default: 0 },
  image: { type: String },
  description: { type: String },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  incompatibleWith: [{ type: String }],
});

const customizationOptionSchema = new Schema<ICustomizationOptionDocument>(
  {
    group: { type: String, required: true, trim: true },
    groupCode: { type: String, required: true, trim: true, unique: true, index: true },
    isRequired: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    compatibleProductTypes: [{ type: String, default: ['all'] }],
    applicableCategories: [{ type: String }],
    options: [singleCustomizationOptionSchema],
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

export const CustomizationOptionModel = model<ICustomizationOptionDocument>(
  'CustomizationOption',
  customizationOptionSchema,
);

import { Schema, model, Document } from 'mongoose';

export interface IFabricDocument extends Document {
  name: string;
  code: string;
  composition: string;
  weight?: number; // Weight in g/m2
  weave?: string;
  origin?: string; // e.g. Biella, Italy
  color?: string;
  pattern?: string;
  season?: string;
  priceAdjustment?: number;
  priceMultiplier: number;
  swatchImage?: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const fabricSchema = new Schema<IFabricDocument>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    composition: { type: String, required: true, trim: true },
    weight: { type: Number },
    weave: { type: String, trim: true },
    origin: { type: String, trim: true },
    color: { type: String, trim: true },
    pattern: { type: String, trim: true },
    season: { type: String, trim: true },
    priceAdjustment: { type: Number, default: 0 },
    priceMultiplier: { type: Number, default: 1.0 },
    swatchImage: { type: String },
    isAvailable: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

export const FabricModel = model<IFabricDocument>('Fabric', fabricSchema);

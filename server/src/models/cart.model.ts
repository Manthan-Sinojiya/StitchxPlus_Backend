import { Schema, model, Document, Types } from 'mongoose';

export interface ICartItemCustomization {
  selectedOptions: Record<string, string>;
  optionAdjustments?: Array<{
    group: string;
    optionCode: string;
    optionName: string;
    priceAdjustment: number;
  }>;
  basePrice?: number;
  totalPrice?: number;
}

export interface ICartItemMeasurementProfile {
  id?: string;
  name: string;
  height?: number;
  chest?: number;
  waist?: number;
  shoulder?: number;
  sleeve?: number;
  neck?: number;
  jacketLength?: number;
  trouserWaist?: number;
  inseam?: number;
  thigh?: number;
  fitPreference?: 'slim' | 'regular' | 'relaxed';
  unit?: 'inches' | 'cm';
}

export interface ICartItem {
  _id?: Types.ObjectId;
  productId: Types.ObjectId;
  quantity: number;
  priceAtAddition: number;
  customization?: ICartItemCustomization;
  measurementProfile?: ICartItemMeasurementProfile;
}

export interface ICartDocument extends Document {
  userId?: Types.ObjectId;
  sessionId?: string;
  items: Types.DocumentArray<ICartItem & Document>;
  couponCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    priceAtAddition: { type: Number, required: true },
    customization: { type: Schema.Types.Mixed },
    measurementProfile: { type: Schema.Types.Mixed },
  },
  {
    _id: true,
  },
);

const cartSchema = new Schema<ICartDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true, sparse: true },
    sessionId: { type: String, index: true, sparse: true },
    items: [cartItemSchema],
    couponCode: { type: String },
  },
  {
    timestamps: true,
  },
);

export const CartModel = model<ICartDocument>('Cart', cartSchema);

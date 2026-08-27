import { Schema, model, Document, Types } from 'mongoose';
import { OrderStatus } from '@stitchx/shared';

export interface IAddressSnapshot {
  firstName: string;
  lastName: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
}

export interface IOrderItemSnapshot {
  productId: Types.ObjectId;
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    basePrice: number;
    image?: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedColor?: { name: string; hex?: string };
  selectedSize?: string;
  customization?: Record<string, any>;
  measurementProfile?: Record<string, any>;
}

export interface IOrderDocument extends Document {
  userId?: Types.ObjectId;
  sessionId?: string;
  orderNumber: string;
  items: IOrderItemSnapshot[];
  shippingAddress: IAddressSnapshot;
  billingAddress: IAddressSnapshot;
  shippingMethod: string;
  subtotal: number;
  discount: number;
  shipping: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod?: string;
  paymentIntentId?: string;
  trackingNumber?: string;
  processedWebhookEvents: string[];
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddressSnapshot>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    street: { type: String, required: true },
    apartment: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
  },
  { _id: false },
);

const orderItemSnapshotSchema = new Schema<IOrderItemSnapshot>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    product: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      slug: { type: String, required: true },
      sku: { type: String, required: true },
      basePrice: { type: Number, required: true },
      image: { type: String },
    },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    selectedColor: { name: { type: String }, hex: { type: String } },
    selectedSize: { type: String },
    customization: { type: Schema.Types.Mixed },
    measurementProfile: { type: Schema.Types.Mixed },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrderDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    sessionId: { type: String, index: true },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    items: [orderItemSnapshotSchema],
    shippingAddress: { type: addressSchema, required: true },
    billingAddress: { type: addressSchema, required: true },
    shippingMethod: { type: String, default: 'Standard Shipping' },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: [
        'PENDING_PAYMENT',
        'PAID',
        'PROCESSING',
        'IN_PRODUCTION',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
        'REFUNDED',
        'pending',
        'processing',
        'tailoring',
        'shipped',
        'delivered',
        'cancelled',
      ],
      default: 'PENDING_PAYMENT',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    paymentMethod: { type: String, default: 'Stripe' },
    paymentIntentId: { type: String, index: true, sparse: true },
    trackingNumber: { type: String, trim: true },
    processedWebhookEvents: [{ type: String }],
  },
  {
    timestamps: true,
  },
);

orderSchema.index({ userId: 1, createdAt: -1 });

export const OrderModel = model<IOrderDocument>('Order', orderSchema);

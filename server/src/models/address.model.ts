import { Schema, model, Document, Types } from 'mongoose';

export interface IAddressDocument extends Document {
  userId: Types.ObjectId;
  isDefault: boolean;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddressDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    isDefault: { type: Boolean, default: false },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
  },
  {
    timestamps: true,
  },
);

export const AddressModel = model<IAddressDocument>('Address', addressSchema);

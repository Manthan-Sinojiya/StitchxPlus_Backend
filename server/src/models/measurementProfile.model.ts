import { Schema, model, Document, Types } from 'mongoose';

export interface IMeasurementProfileDocument extends Document {
  userId: Types.ObjectId;
  name: string;
  height: number;
  chest: number;
  waist: number;
  shoulder: number;
  sleeve: number;
  neck: number;
  jacketLength: number;
  trouserWaist: number;
  inseam: number;
  thigh: number;
  fitPreference: 'slim' | 'regular' | 'relaxed';
  unit: 'inches' | 'cm';
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const measurementProfileSchema = new Schema<IMeasurementProfileDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    height: { type: Number, required: true },
    chest: { type: Number, required: true },
    waist: { type: Number, required: true },
    shoulder: { type: Number, required: true },
    sleeve: { type: Number, required: true },
    neck: { type: Number, required: true },
    jacketLength: { type: Number, required: true },
    trouserWaist: { type: Number, required: true },
    inseam: { type: Number, required: true },
    thigh: { type: Number, required: true },
    fitPreference: { type: String, enum: ['slim', 'regular', 'relaxed'], default: 'regular' },
    unit: { type: String, enum: ['inches', 'cm'], default: 'inches' },
    isDefault: { type: Boolean, default: false },
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

export const MeasurementProfileModel = model<IMeasurementProfileDocument>(
  'MeasurementProfile',
  measurementProfileSchema,
);

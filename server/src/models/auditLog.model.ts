import { Schema, model, Document } from 'mongoose';

export interface IAuditLogDocument extends Document {
  userId: string;
  userEmail: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLogDocument>(
  {
    userId: { type: String, required: true, index: true },
    userEmail: { type: String, required: true },
    userName: { type: String, required: true },
    action: { type: String, required: true, index: true },
    entityType: { type: String, required: true, index: true },
    entityId: { type: String, required: true },
    changes: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export const AuditLogModel = model<IAuditLogDocument>('AuditLog', auditLogSchema);

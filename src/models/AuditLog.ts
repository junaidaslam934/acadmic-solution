import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  entityId?: mongoose.Types.ObjectId;
  details?: Record<string, unknown>;
  ipAddress?: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userRole: { type: String, required: true },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId, default: null },
    details: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { collection: 'auditlogs' }
);

AuditLogSchema.index({ entity: 1, entityId: 1 });
AuditLogSchema.index({ userId: 1 });
AuditLogSchema.index({ timestamp: -1 });

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
export default AuditLog;

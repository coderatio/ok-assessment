import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { PaymentLog } from './payment-logs.schema';

export type PaymentDocument = Payment & Document;

export enum PaymentStatus {
  INITIATED = 'initiated',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  FAILED = 'failed',
}

export enum PaymentType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

@Schema()
export class Payment {
  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, default: 'NGN' })
  currency: string;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.INITIATED })
  status: PaymentStatus;

  @Prop({ type: String, enum: PaymentType })
  type: PaymentType;

  @Prop({ unique: true, required: true })
  ref: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true })
  debitWallet: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true })
  creditWallet: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Types.ObjectId, ref: 'PaymentLog' })
  logs: PaymentLog[];

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

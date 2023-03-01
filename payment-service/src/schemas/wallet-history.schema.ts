import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { PaymentType } from './payment.schema';

export type WalletHistoryDocument = WalletHistory & Document;

@Schema()
export class WalletHistory {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true })
  wallet: mongoose.Schema.Types.ObjectId;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: String, enum: PaymentType })
  type: PaymentType;

  @Prop({ type: Number, required: true })
  previousBalance: number;

  @Prop({ type: Number, default: true })
  currentBalance: number;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const WalletHistorySchema = SchemaFactory.createForClass(WalletHistory);

WalletHistorySchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

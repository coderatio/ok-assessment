import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { WalletHistory } from './wallet-history.schema';
import { PaymentStatus } from './payment.schema';

export type RefundDocument = Refund & Document;

@Schema()
export class Refund {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  owner: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true,
  })
  payment: mongoose.Schema.Types.ObjectId;

  @Prop({ default: 0 })
  amount: number;

  @Prop({ type: String, required: true })
  ref: string;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.INITIATED })
  status: PaymentStatus;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const RefundSchema = SchemaFactory.createForClass(Refund);

RefundSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

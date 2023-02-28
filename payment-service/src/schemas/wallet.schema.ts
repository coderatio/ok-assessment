import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { WalletHistory } from './wallet-history.schema';

export type WalletDocument = Wallet & Document;

@Schema()
export class Wallet {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  owner: mongoose.Schema.Types.ObjectId;

  @Prop({ default: 0 })
  amount: number;

  @Prop({ enum: ['NGN', 'USD'], default: 'NGN' })
  currency: string;

  @Prop({ default: process.env.DEFAULT_DAILY_LIMIT })
  dailyLimit: number;

  @Prop({ type: mongoose.Types.ObjectId, ref: 'WalletHistory' })
  histories: WalletHistory[];

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);

WalletSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

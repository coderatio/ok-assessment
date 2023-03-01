import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { PaymentStatus } from './payment.schema';

export type PaymentLogDocument = PaymentLog;

@Schema()
export class PaymentLog extends Document {
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
        required: true,
    })
    payment: mongoose.Schema.Types.ObjectId;

    @Prop({ type: String, required: true })
    ref: string;

    @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.INITIATED })
    status: PaymentStatus;

    @Prop({ type: Object })
    metadata?: Record<string, any>;

    @Prop({ type: Date, default: Date.now })
    createdAt: Date;

    @Prop({ type: Date, default: Date.now })
    updatedAt: Date;
}

export const PaymentLogSchema = SchemaFactory.createForClass(PaymentLog);
mongoose.model('PaymentLog', PaymentLogSchema, 'PaymentLog')

PaymentLogSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    },
});

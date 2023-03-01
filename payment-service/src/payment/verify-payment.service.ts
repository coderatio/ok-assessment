import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Payment, PaymentDocument } from "src/schemas/payment.schema";
import { Refund, RefundDocument } from "src/schemas/refund.schema";

@Injectable()
export class VerifyPaymentService {
    constructor(
        @InjectModel(Payment.name)
        private readonly paymentModel: Model<PaymentDocument>,

        @InjectModel(Refund.name)
        private readonly refundModel: Model<RefundDocument>,
    ) { }

    async verify(id: string) {
        const refund = await this.verifyRefund(id)
        if (refund) {
            return refund
        }

        const payment = await this.verifyPayment(id)
        if (payment) {
            return payment
        }

        throw new NotFoundException('No payment or refund with that ID')
    }

    private async verifyRefund(id: string) {
        const refund = await this.refundModel.findById(id)

        if (!refund) {
            return false
        }

        return {
            amount: refund.amount,
            id: refund.payment,
            createdAt: refund.createdAt,
            status: refund.status
        }
    }

    private async verifyPayment(id: string) {
        const payment = await this.paymentModel.findById(id)

        if (!payment) {
            return false
        }

        return {
            amount: payment.amount,
            id: payment.id,
            createdAt: payment.createdAt,
            status: payment.status
        }
    }
}
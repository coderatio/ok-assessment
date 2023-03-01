import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import mongoose, { Model } from 'mongoose';
import { PaymentLog, PaymentLogDocument } from './schemas/payment-logs.schema';
import { Payment, PaymentDocument, PaymentStatus } from './schemas/payment.schema';
import { Wallet, WalletDocument } from './schemas/wallet.schema';

@Injectable()
export class ScheduleService {
    private readonly logger = new Logger(ScheduleService.name)

    constructor(
        @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
        @InjectModel(PaymentLog.name) private readonly paymentLogModel: Model<PaymentLogDocument>,
        @InjectModel(Wallet.name) private readonly walletModel: Model<WalletDocument>,
        @InjectConnection() private readonly connection: mongoose.Connection,
    ) { }

    @Cron(CronExpression.EVERY_5_SECONDS)
    async handlePaymentsCron() {
        this.processPendingPayments()
    }

    private async processPendingPayments() {
        let updatedCount = 0;
        let cursor = this.paymentModel
            .find({ status: PaymentStatus.INITIATED })
            .batchSize(10)
            .cursor();

        let payment = await cursor.next();

        if (!payment) {
            //this.logger.log('No more payments to process')
            return
        }

        const session = await this.connection.startSession()

        session.startTransaction()
        try {
            while (payment) {
                const creditWallet = await this.walletModel.findById(payment.creditWallet)
                const debitWallet = await this.walletModel.findById(payment.debitWallet)
                if (creditWallet && debitWallet) {
                    creditWallet.amount += payment.amount;
                    payment.status = PaymentStatus.PROCESSED;
                    await creditWallet.save({ session })
                    await payment.save({ session })

                    const logMessage = `Sent ${payment.amount} from ${debitWallet.id} to ${creditWallet.id}`

                    const log = new this.paymentLogModel({
                        payment: payment.id,
                        ref: payment.ref,
                        status: PaymentStatus.PROCESSED,
                        metadata: {
                            message: logMessage
                        }
                    })

                    this.logger.log(logMessage)

                    await log.save({ session })

                    await session.commitTransaction()
                }

                updatedCount++;
                payment = await cursor.next();
            }

            return updatedCount;
        } catch (error) {
            await session.abortTransaction()

            this.logger.error(error)
        } finally {
            session.endSession()
        }
    }
}

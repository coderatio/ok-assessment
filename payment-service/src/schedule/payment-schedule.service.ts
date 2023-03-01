import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import mongoose, { Model } from 'mongoose';
import { PaymentLog, PaymentLogDocument } from '../schemas/payment-logs.schema';
import {
  Payment,
  PaymentDocument,
  PaymentStatus,
  PaymentType,
} from '../schemas/payment.schema';
import { Refund, RefundDocument } from '../schemas/refund.schema';
import {
  WalletHistory,
  WalletHistoryDocument,
} from '../schemas/wallet-history.schema';
import { Wallet, WalletDocument } from '../schemas/wallet.schema';

@Injectable()
export class PaymentScheduleService {
  private readonly logger = new Logger(PaymentScheduleService.name);

  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(PaymentLog.name)
    private readonly paymentLogModel: Model<PaymentLogDocument>,
    @InjectModel(Wallet.name)
    private readonly walletModel: Model<WalletDocument>,
    @InjectModel(WalletHistory.name)
    private readonly walletHistoryModel: Model<WalletHistoryDocument>,
    @InjectModel(Refund.name)
    private readonly refundModel: Model<RefundDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async handlePaymentsCron() {
    this.processPendingPayments();
  }

  private async processPendingPayments() {
    let updatedCount = 0;
    let cursor = this.paymentModel
      .find({ status: PaymentStatus.INITIATED })
      .batchSize(10)
      .cursor();

    let payment = await cursor.next();

    if (!payment) {
      this.logger.log('No more payments to process');
      return;
    }

    const session = await this.connection.startSession();

    session.startTransaction();
    try {
      while (payment) {
        const creditWallet = await this.walletModel.findById(
          payment.creditWallet,
        );
        const debitWallet = await this.walletModel.findById(
          payment.debitWallet,
        );
        if (creditWallet && debitWallet) {
          let previousBalance = creditWallet.amount;

          creditWallet.amount += payment.amount;
          payment.status = PaymentStatus.PROCESSED;

          await creditWallet.save({ session });
          await payment.save({ session });

          // keep history of credit wallet
          let currentBalance = creditWallet.amount;
          const creditWalletHistory = new this.walletHistoryModel({
            user: payment.user,
            wallet: creditWallet.id,
            amount: payment.amount,
            previousBalance,
            currentBalance,
            type: PaymentType.CREDIT,
          });

          await creditWalletHistory.save({ session });

          const logMessage = `Sent ${payment.amount} from ${debitWallet.id} to ${creditWallet.id}`;

          const log = new this.paymentLogModel({
            payment: payment.id,
            ref: payment.ref,
            status: PaymentStatus.PROCESSED,
            metadata: {
              message: logMessage,
            },
          });

          this.logger.log(logMessage);

          await log.save({ session });

          await session.commitTransaction();
        }

        updatedCount++;
        payment = await cursor.next();
      }

      return updatedCount;
    } catch (error) {
      await session.abortTransaction();

      this.logger.error(error);
    } finally {
      session.endSession();
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import mongoose, { ClientSession, Model } from 'mongoose';
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
export class RefundScheduleService {
  private readonly logger = new Logger(RefundScheduleService.name);

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

  @Cron(CronExpression.EVERY_10_SECONDS)
  public async handle() {
    let updatedCount = 0;
    let cursor = this.refundModel
      .find({ status: PaymentStatus.INITIATED })
      .batchSize(10)
      .cursor();

    let refund = await cursor.next();

    if (!refund) {
      this.logger.log('No more refunds to process');
      return;
    }

    const session = await this.connection.startSession();

    session.startTransaction();
    try {
      while (refund) {
        const payment = await this.paymentModel.findById(refund.payment);

        if (payment) {
          const creditWallet = await this.walletModel.findById(
            payment.creditWallet,
          );
          const debitWallet = await this.walletModel.findById(
            payment.debitWallet,
          );

          let previousBalance = creditWallet.amount;
          let currentBalance = creditWallet.amount - refund.amount;
          await this.createWalletHistory(
            creditWallet,
            refund.amount,
            previousBalance,
            currentBalance,
            session,
            PaymentType.DEBIT,
          );

          previousBalance = debitWallet.amount;
          currentBalance = debitWallet.amount + refund.amount;
          await this.createWalletHistory(
            debitWallet,
            refund.amount,
            previousBalance,
            currentBalance,
            session,
            PaymentType.CREDIT,
          );

          await this.executeRefund(
            creditWallet,
            debitWallet,
            refund,
            payment,
            session,
          );

          await session.commitTransaction();
        }

        updatedCount++;
        refund = await cursor.next();
      }

      return updatedCount;
    } catch (error) {
      await session.abortTransaction();

      this.logger.error(error);
    } finally {
      session.endSession();
    }
  }

  private async executeRefund(
    creditWallet: WalletDocument,
    debitWallet: WalletDocument,
    refund: RefundDocument,
    payment: PaymentDocument,
    session: ClientSession,
  ) {
    creditWallet.amount -= refund.amount;
    debitWallet.amount += refund.amount;

    refund.status = PaymentStatus.PROCESSED;

    await creditWallet.save({ session });
    await debitWallet.save({ session });
    await refund.save({ session });

    const logMessage = `${payment.currency}${refund.amount} was refunded from ${creditWallet.id} to ${debitWallet.id}`;

    const log = new this.paymentLogModel({
      payment: payment.id,
      ref: payment.ref,
      status: PaymentStatus.PROCESSED,
      metadata: {
        message: logMessage,
        wallets: {
          from: creditWallet.id,
          to: debitWallet.id,
        },
      },
    });

    this.logger.log(logMessage);

    await log.save({ session });
  }

  private async createWalletHistory(
    wallet: WalletDocument,
    amount: number,
    previousBalance: number,
    currentBalance: number,
    session: ClientSession,
    type: PaymentType,
  ) {
    const walletHistory = new this.walletHistoryModel({
      user: wallet.owner,
      wallet: wallet.id,
      amount,
      previousBalance,
      currentBalance,
      type,
    });

    await walletHistory.save({ session });
  }
}

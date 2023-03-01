import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateRefundDto } from 'src/common/dto/create-refund.dto';
import { InitiatePaymentRequestDto } from 'src/common/dto/initiate-payment.dto';
import {
  PaymentLog,
  PaymentLogDocument,
} from 'src/schemas/payment-logs.schema';
import {
  Payment,
  PaymentDocument,
  PaymentStatus,
  PaymentType,
} from 'src/schemas/payment.schema';
import { Refund, RefundDocument } from 'src/schemas/refund.schema';
import { Wallet, WalletDocument } from 'src/schemas/wallet.schema';
import { CreatePaymentAction } from './actions/create-payment.action';
import { v4 as uuidv4 } from 'uuid';
import {
  WalletHistory,
  WalletHistoryDocument,
} from 'src/schemas/wallet-history.schema';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectModel(Wallet.name)
    private readonly walletModel: Model<WalletDocument>,
    @InjectModel(WalletHistory.name)
    private readonly wallethistoryModel: Model<WalletHistoryDocument>,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(PaymentLog.name)
    private readonly paymentLogModel: Model<PaymentLogDocument>,
    @InjectModel(Refund.name)
    private readonly refundModel: Model<RefundDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) { }

  async findAll(filters?: any): Promise<Payment[]> {
    return this.paymentModel.find(filters)
  }

  async createPayment(
    user: string,
    payload: InitiatePaymentRequestDto,
  ): Promise<Payment> {
    const session = await this.connection.startSession();

    session.startTransaction();
    try {
      const paymentItems = await CreatePaymentAction.execute(
        this.paymentModel,
        this.walletModel,
        { ...{ user }, ...payload },
      );

      const payments = await this.paymentModel.insertMany(paymentItems, {
        session,
      });

      await this.createPaymentLogs(payments);
      await this.createWalletHistory(payments);

      await session.commitTransaction();

      const payment: any = payments.shift();
      payment.updatedAt = undefined;

      const response = { ...{ owner: payment.user }, ...payment.toJSON() };
      response.user = undefined;

      return response;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Creates a refund
   *
   * @param createRefundDto CreateRefundDto
   * @returns any
   */
  async createRefund(createRefundDto: CreateRefundDto) {
    const payment = await this.paymentModel.findById(createRefundDto.payment);
    if (!payment) {
      throw new BadRequestException('Payment does not exist.');
    }

    if (String(payment.user) !== createRefundDto.owner) {
      throw new BadRequestException('Payment does not belong to you.');
    }

    const totalValidRefunds = await this.getTotalRefundsForPayment(payment.id);
    if (totalValidRefunds + createRefundDto.amount > payment.amount) {
      throw new BadRequestException(
        `Total refunds of ${totalValidRefunds}(existing refunds) + ${createRefundDto.amount}(new) ` +
        `can't be more than payment amount ${payment.amount}. `,
      );
    }

    const session = await this.connection.startSession();

    session.startTransaction();
    try {
      const createdRefund = new this.refundModel({
        ...{ ref: uuidv4() },
        ...createRefundDto,
      });

      await createdRefund.save({ session });

      const message = `Initated refund of ${createRefundDto.amount} for payment(${payment.id})`;

      const paymentLog = new this.paymentLogModel({
        payment: payment.id,
        ref: payment.ref,
        metadata: {
          message,
        },
      });

      await paymentLog.save({ session });

      this.logger.log(message);

      await session.commitTransaction();

      return {
        id: createdRefund.id,
        payment: payment.id,
        owner: createRefundDto.owner,
        amount: createdRefund.amount,
        ref: createdRefund.ref,
        status: createdRefund.status,
        createdAt: createdRefund.createdAt,
      };
    } catch (error) {
      await session.abortTransaction();
      this.logger.error(error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  private async getTotalRefundsForPayment(paymentId: string) {
    const totalAmount = await this.refundModel.aggregate([
      {
        $match: {
          $and: [
            {
              $expr: {
                $eq: ['$payment', { $toObjectId: paymentId }],
              },
            },
            {
              status: { $nin: [PaymentStatus.FAILED, PaymentStatus.DECLINED] },
            },
          ],
        },
      },
      {
        $group: {
          _id: null,
          amount: { $sum: '$amount' },
        },
      },
    ]);

    return totalAmount.length ? totalAmount[0].amount : 0;
  }

  private async createWalletHistory(payments: PaymentDocument[]) {
    const historyItems = payments.map(async (payment) => {
      const debitWallet = await this.walletModel.findById(payment.debitWallet);

      return {
        user: payment.user,
        wallet: debitWallet.id,
        amount: payment.amount,
        previousBalance: debitWallet.amount,
        currentBalance: debitWallet.amount - payment.amount,
        type: PaymentType.DEBIT,
      };
    });

    await this.wallethistoryModel.insertMany(await Promise.all(historyItems));
  }

  private async createPaymentLogs(payments: PaymentDocument[]): Promise<void> {
    const logItems = payments.map((payment) => ({
      payment: payment.id,
      ref: payment.ref,
      metadata: {
        message: `Payment initated for the amount of ${payment.currency}${payment.amount}`,
      },
    }));

    await this.paymentLogModel.insertMany(logItems);
  }
}

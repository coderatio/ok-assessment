import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import mongoose, { Model } from 'mongoose';
import { InitiatePaymentRequestDto } from 'src/common/dto/initiate-payment.dto';
import {
  PaymentLog,
  PaymentLogDocument,
} from 'src/schemas/payment-logs.schema';
import { Payment, PaymentDocument } from 'src/schemas/payment.schema';
import { Wallet, WalletDocument } from 'src/schemas/wallet.schema';
import { CreatePaymentAction } from './actions/create-payment.action';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectModel(Wallet.name)
    private readonly walletModel: Model<WalletDocument>,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(PaymentLog.name)
    private readonly paymentLogModel: Model<PaymentLogDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

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
    
  async findInChunks(query: any, chunkSize: number) {
    const cursor = this.paymentModel
      .find(query)
      .batchSize(chunkSize)
      .cursor();

    let result = [];
    let chunk = await cursor.next();
    while (chunk) {
      result = [...result, chunk];
      chunk = await cursor.next();
    }

    return result;
  }

  private async createPaymentLogs(payments: PaymentDocument[]): Promise<void> {
    const logItems = payments.map(payment => ({
      payment: payment.id,
      ref: payment.ref,
      metadata: {
        message: `Payment initated for the amount of ${payment.currency}${payment.amount}`,
      },
    }));

    await this.paymentLogModel.insertMany(logItems);
  }
}

import { BadGatewayException, BadRequestException } from '@nestjs/common';
import * as moment from 'moment';
import { Model } from 'mongoose';
import { SUPPORTED_CURRENCIES } from 'src/common/constants';
import {
    InitiatePaymentDto,
    InitiatePaymentRequestDto,
} from 'src/common/dto/initiate-payment.dto';
import {
    PaymentDocument,
    PaymentStatus,
    PaymentType,
} from 'src/schemas/payment.schema';
import { WalletDocument } from 'src/schemas/wallet.schema';
import { v4 as uuidv4 } from 'uuid';

export class CreatePaymentAction {
    private paymentModel: any;
    private walletModel: any;

    public static async execute(
        paymentModel: Model<PaymentDocument>,
        walletModel: Model<WalletDocument>,
        payload: InitiatePaymentRequestDto,
    ): Promise<InitiatePaymentDto[]> {
        const $this = new CreatePaymentAction();

        $this.paymentModel = paymentModel;
        $this.walletModel = walletModel;

        try {
            return await Promise.all(
                payload.payments.map(async (payment) => {
                    const mutatedPayment = {
                        ...{
                            ref: uuidv4(),
                            type: PaymentType.DEBIT,
                            status: PaymentStatus.INITIATED,
                            user: (payload as any).user,
                        },
                        ...payment,
                    };

                    await $this.validatePaymentItem(mutatedPayment);
                    return mutatedPayment;
                }),
            );
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    private async validatePaymentItem(
        payment: InitiatePaymentDto,
    ): Promise<void> {
        this.validatePaymentItemStructure(payment);
        this.validateCurrency(payment);
        await this.validatePaymentItemAmount(payment);
        await this.validateCurrencyAndWalletsAndCreateDebit(payment);
    }

    private validatePaymentItemStructure(payment: InitiatePaymentDto): void {
        if (
            !payment.amount ||
            !payment.currency ||
            !payment.debitWallet ||
            !payment.creditWallet
        ) {
            throw new BadRequestException('Invalid payment item structure.');
        }
    }

    private validateCurrency(payment: InitiatePaymentDto) {
        if (!SUPPORTED_CURRENCIES.includes(payment.currency)) {
            throw new BadRequestException('Unsupported currency provided.');
        }
    }

    private async validateCurrencyAndWalletsAndCreateDebit(
        payment: InitiatePaymentDto,
    ): Promise<void> {
        const debitWallet = await this.walletModel.findById(payment.debitWallet);
        const creditWallet = await this.walletModel.findById(payment.creditWallet);

        if (!debitWallet || !creditWallet) {
            throw new BadRequestException(`Invalid debit or credit wallet ID.`);
        }
        if (
            debitWallet.currency !== payment.currency ||
            creditWallet.currency !== payment.currency
        ) {
            throw new BadRequestException(
                'Debit and credit wallets must be of the same currency.',
            );
        }

        if (String(debitWallet.owner) !== payment.user) {
            throw new BadRequestException(`Initiator must be the owner of debit wallet. Request denied!`)
        }

        if (payment.debitWallet === payment.creditWallet) {
            throw new BadRequestException(`Debit and Credit wallets must be unique.`);
        }

        if (payment.amount >= debitWallet.amount) {
            throw new BadRequestException(
                `Insufficient funds in wallet(${debitWallet.id}). Modify payment item amount.`,
            );
        }

        await this.validatePaymentItemDailyLimit(payment, debitWallet);

        debitWallet.amount -= payment.amount;
        await debitWallet.save();
    }

    private async validatePaymentItemAmount(
        payment: InitiatePaymentDto,
    ): Promise<void> {
        if (payment.amount <= 0) {
            throw new BadRequestException(
                'Payment amount must be greater than zero.',
            );
        }
    }

    private async validatePaymentItemDailyLimit(
        payment: InitiatePaymentDto,
        debitWallet: WalletDocument,
    ): Promise<void> {
        const totalAmount = await this.getTotalPaymentAmountForDebitWalletToday(
            payment.debitWallet,
        );

        if (payment.amount > debitWallet.dailyLimit) {
            throw new BadRequestException(
                `Payment amount ${payment.amount} exceeds daily limit ${debitWallet.dailyLimit} for wallet(${debitWallet.id}).`,
            );
        }
        if (totalAmount + payment.amount > debitWallet.dailyLimit) {
            throw new BadRequestException(
                `Payment amount ${payment.amount} exceeds daily limit of ${debitWallet.dailyLimit} for wallet(${debitWallet.id}).`,
            );
        }
    }

    private async getTotalPaymentAmountForDebitWalletToday(
        debitWalletId: string,
    ): Promise<number> {
        try {
            const today = moment().startOf('day').toDate();
            const totalAmount = await this.paymentModel.aggregate([
                {
                    $match: {
                        $and: [
                            {
                                $expr: {
                                    $eq: ['$debitWallet', { $toObjectId: debitWalletId }],
                                },
                            },
                            { status: { $ne: PaymentStatus.FAILED } },
                            { createdAt: { $gte: today } },
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
        } catch (error) {
            throw error;
        }
    }
}

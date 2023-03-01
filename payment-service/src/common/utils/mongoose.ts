import { ModelDefinition } from '@nestjs/mongoose';
import { PaymentLog, PaymentLogSchema } from 'src/schemas/payment-logs.schema';
import { Payment, PaymentSchema } from 'src/schemas/payment.schema';
import { Refund, RefundSchema } from 'src/schemas/refund.schema';
import {
  WalletHistory,
  WalletHistorySchema,
} from 'src/schemas/wallet-history.schema';
import { Wallet, WalletSchema } from 'src/schemas/wallet.schema';

export const modelsDefinitions: ModelDefinition[] = [
  { name: Wallet.name, schema: WalletSchema, collection: Wallet.name },
  {
    name: WalletHistory.name,
    schema: WalletHistorySchema,
    collection: WalletHistory.name,
  },
  { name: Payment.name, schema: PaymentSchema, collection: Payment.name },
  {
    name: PaymentLog.name,
    schema: PaymentLogSchema,
    collection: PaymentLog.name,
  },
  { name: Refund.name, schema: RefundSchema, collection: Refund.name },
];

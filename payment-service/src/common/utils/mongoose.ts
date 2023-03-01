import { PaymentLog, PaymentLogSchema } from "src/schemas/payment-logs.schema";
import { Payment, PaymentSchema } from "src/schemas/payment.schema";
import { WalletHistory, WalletHistorySchema } from "src/schemas/wallet-history.schema";
import { Wallet, WalletSchema } from "src/schemas/wallet.schema";

export const modelsDefinitions = [
    { name: Wallet.name, schema: WalletSchema, collection: Wallet.name },
    { name: WalletHistory.name, schema: WalletHistorySchema, collection: WalletHistory.name },
    { name: Payment.name, schema: PaymentSchema, collection: Payment.name },
    { name: PaymentLog.name, schema: PaymentLogSchema, collection: PaymentLog.name },
]
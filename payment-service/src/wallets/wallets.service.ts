import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { FundWalletDto } from 'src/common/dto/fund-wallet.dto';
import { WalletCreateDto } from 'src/common/dto/wallet-create.dto';
import { PaymentType } from 'src/schemas/payment.schema';
import {
  WalletHistory,
  WalletHistoryDocument,
} from 'src/schemas/wallet-history.schema';
import { Wallet, WalletDocument } from 'src/schemas/wallet.schema';

@Injectable()
export class WalletsService {
  private readonly logger = new Logger('WalletService');

  constructor(
    @InjectModel(Wallet.name)
    private readonly walletModel: Model<WalletDocument>,
    @InjectModel(WalletHistory.name)
    private readonly walletHistoryModel: Model<WalletHistoryDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async create(walletCreateDto: WalletCreateDto): Promise<WalletDocument> {
    const wallet = new this.walletModel(walletCreateDto);
    await wallet.save();

    this.logger.log(`Created wallet with ID: ${wallet.id}`);
    return wallet;
  }

  async findById(id: string): Promise<Wallet> {
    return this.walletModel.findById(id).select(['-_id -__v']).exec();
  }

  async findAll(filters?: object): Promise<Wallet[]> {
    return this.walletModel.find(filters);
  }

  async fund(
    fundWalletDto: FundWalletDto,
  ): Promise<[WalletDocument, Error | null]> {
    const session = await this.connection.startSession();

    session.startTransaction();
    try {
      const wallet = await this.walletModel
        .findById(fundWalletDto.wallet)
        .exec();

      if (!wallet) {
        throw new NotFoundException(
          'Wallet does not exist or does not belongs to you.',
        );
      }

      if (fundWalletDto.amount <= 0) {
        throw new BadRequestException('Invalid amount provided');
      }

      const previousBalance = wallet.amount;

      wallet.$inc('amount', fundWalletDto.amount);
      await wallet.save({ session });

      const currentBalance = wallet.amount;

      const walletHistory = new this.walletHistoryModel({
        user: wallet.owner,
        wallet: wallet.id,
        amount: fundWalletDto.amount,
        type: PaymentType.CREDIT,
        previousBalance,
        currentBalance,
      });

      await walletHistory.save({ session });

      await session.commitTransaction();

      return [wallet, null];
    } catch (err) {
      this.logger.error(err);
      await session.abortTransaction();

      return [new Wallet() as WalletDocument, Error(err.message)];
    } finally {
      session.endSession();
    }
  }
}

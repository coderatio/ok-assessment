import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WalletCreateDto } from 'src/common/dto/wallet-create.dto';
import { Wallet, WalletDocument } from 'src/schemas/wallet.schema';

@Injectable()
export class WalletsService {
  private readonly logger = new Logger('WalletService');

  constructor(
    @InjectModel('Wallet') private readonly walletModel: Model<WalletDocument>,
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
}

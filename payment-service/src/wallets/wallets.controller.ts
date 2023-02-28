import {
    Body,
    Controller,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { WalletCreateDto } from 'src/common/dto/wallet-create.dto';
import { Responsable } from 'src/common/utils/responsable';
import { WalletsService } from './wallets.service';
import mongoose from 'mongoose';

interface IGetWallet {
    userId: mongoose.Types.ObjectId;
    walletId: mongoose.Types.ObjectId;
}

@Controller('wallets')
export class WalletsController {
    private readonly logger = new Logger('WalletsController');

    constructor(private readonly walletService: WalletsService) { }

    @MessagePattern({ role: 'wallets', cmd: 'create' })
    async create(walletCreateDto: WalletCreateDto) {
        const wallet = await this.walletService.create(walletCreateDto);

        return Responsable.sendRpcSuccess('Wallet created successfully', {
            id: wallet.id,
            owner: wallet.owner,
            amount: wallet.amount,
            currency: wallet.currency,
            dailyLimit: wallet.dailyLimit,
        });
    }

    @MessagePattern({ role: 'wallets', cmd: 'get' })
    async find(data: IGetWallet) {
        try {
            const wallets = await this.walletService.findAll(this.getQuery(data));

            if (data.walletId) {
                if (wallets.length === 0) {
                    return Responsable.sendRpcError(
                        'Wallet not found or doesn not belong to you.',
                        HttpStatus.NOT_FOUND,
                    );
                }

                return Responsable.sendRpcSuccess(
                    'Wallet reteived successfully',
                    wallets.shift(),
                );
            }

            return Responsable.sendRpcSuccess('Owner wallets retreived', wallets);
        } catch (error) {
            if (!(error instanceof Error)) {
                throw new Error(error.message);
            }

            return;
        }
    }

    private getQuery(data: IGetWallet) {
        const query = data.walletId
            ? {
                _id: data.walletId,
                owner: this.getOwnerObjectFromString(data.userId),
            }
            : { owner: this.getOwnerObjectFromString(data.userId) };

        return query;
    }

    private getOwnerObjectFromString(id: mongoose.Types.ObjectId): mongoose.Types.ObjectId {
        return new mongoose.Types.ObjectId(id);
    }
}

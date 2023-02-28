import { Body, Controller, HttpStatus, Logger, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { MessagePattern } from '@nestjs/microservices';
import { WalletCreateDto } from 'src/common/dto/wallet-create.dto';
import { Responsable } from 'src/common/utils/responsable';
import { WalletsService } from './wallets.service';
import mongoose from 'mongoose';
import { FundWalletDto } from 'src/common/dto/fund-wallet.dto';
import { PrincipalGuard } from 'src/guards/principal.guard';

interface IGetWallet {
  userId: mongoose.Types.ObjectId;
  walletId: mongoose.Types.ObjectId;
}

@Controller('wallets')
export class WalletsController {
  private readonly logger = new Logger('WalletsController');

  constructor(private readonly walletService: WalletsService) {}

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
    
  @Post('fund')
  @UseGuards(PrincipalGuard)
  async fund(@Body() fundWalletDto: FundWalletDto, @Res() res: Response) {
    const [wallet, error] = await this.walletService.fund(fundWalletDto);

    if (error !== null) {
      return Responsable.sendError(
        res,
        error.message,
        HttpStatus.BAD_REQUEST,
      );
    }

    return Responsable.sendSuccess(res, 'Wallet funded successfully', {
      wallet: {
        id: wallet.id,
        amount: fundWalletDto.amount,
        balance: wallet.amount,
      },
    });
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

  private getOwnerObjectFromString(
    id: mongoose.Types.ObjectId,
  ): mongoose.Types.ObjectId {
    return new mongoose.Types.ObjectId(id);
  }
}

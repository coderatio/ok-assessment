import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrincipalGuard } from 'src/guards/principal.guard';
import { WalletsService } from './wallets.service';
import { Responsable } from 'src/common/utils/responsable';
import mongoose, { Error } from 'mongoose';
import { WalletCreateDto } from 'src/common/dto/wallet-create.dto';

@Controller('wallets')
export class WalletsController {
  constructor(
    private readonly walletService: WalletsService,
  ) { }

  @Post()
  @UseGuards(PrincipalGuard)
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Body() walletCreateDto: WalletCreateDto,
  ) {
    const user = req.user as any;
    const ownerObject = !walletCreateDto.owner ? { owner: user.id } : {};
    const response = await this.walletService.create({
      ...ownerObject,
      ...walletCreateDto,
    });

    if (response?.error) {
      return Responsable.sendError(res, response.message, response.code)
    }

    return Responsable.sendSuccess(res, response.message, response.data)
  }

  @Get(':id?')
  @UseGuards(PrincipalGuard)
  async find(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const userId = (req.user as any).id;
      const query = id ? { walletId: id, userId } : { userId };

      const response = await this.walletService.findAll(query);
      if (response?.error) {
        return Responsable.sendError(res, response.message, response.code)
      }

      return Responsable.sendSuccess(res, response.message, response.data)
    } catch (error) {
      if (!(error instanceof Error)) {
        throw new Error(error.message);
      }

      return Responsable.sendError(res, 'Failed to get wallet(s).');
    }
  }
}

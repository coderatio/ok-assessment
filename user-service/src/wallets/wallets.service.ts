import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PAYMENT_SERVICE } from 'src/common/constants';
import { WalletCreateDto } from 'src/common/dto/wallet-create.dto';
import { RpcClient } from 'src/common/utils/rpc';

@Injectable()
export class WalletsService {
  constructor(
    @Inject(PAYMENT_SERVICE) private readonly paymentClient: ClientProxy,
  ) {}

  async create(data: WalletCreateDto): Promise<any> {
    return this.sendClientMessage({ role: 'wallets', cmd: 'create' }, data);
  }

  async findAll(data): Promise<any> {
    return this.sendClientMessage({ role: 'wallets', cmd: 'get' }, data);
  }

  private sendClientMessage(pattern: any, data: any) {
    return RpcClient.send(this.paymentClient, pattern, data);
  }
}

import { IsIn, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import mongoose from 'mongoose';
import { SUPPORTED_CURRENCIES } from '../constants';

export class WalletCreateDto {
  @IsOptional()
  owner: mongoose.Types.ObjectId;

  @IsOptional()
  @IsNumber()
  @Min(1)
  amount?: number;

  @IsOptional()
  @IsIn(SUPPORTED_CURRENCIES)
  currency?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  dailyLimit: number;
}

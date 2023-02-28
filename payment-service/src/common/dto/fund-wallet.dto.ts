import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
import mongoose from 'mongoose';

export class FundWalletDto {
  @IsNotEmpty()
  @IsPositive()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  wallet: mongoose.Types.ObjectId;
}

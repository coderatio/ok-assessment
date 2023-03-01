import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import mongoose from 'mongoose';

export class CreateRefundDto {
  @IsOptional()
  @IsString()
  owner: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;

  @IsNotEmpty()
  @IsString()
  payment: string;
}

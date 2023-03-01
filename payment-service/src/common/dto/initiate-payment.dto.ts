import {
  IsArray,
  ValidateNested,
  IsNumber,
  IsObject,
  IsString,
  IsOptional,
  IsNotEmpty,
  ArrayNotEmpty,
  IsIn,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SUPPORTED_CURRENCIES } from '../constants';

export class InitiatePaymentDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsString()
  user: string;

  @IsString()
  @IsNotEmpty()
  //@IsIn([SUPPORTED_CURRENCIES])
  currency: string;

  @IsString()
  @IsNotEmpty()
  debitWallet: string;

  @IsString()
  @IsNotEmpty()
  creditWallet: string;

  @IsObject()
  @IsOptional()
  metadata: Record<string, unknown>;
}

export class InitiatePaymentRequestDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => InitiatePaymentDto)
  payments: InitiatePaymentDto[];
}

import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { Request, Response } from 'express';
import {
  InitiatePaymentDto,
  InitiatePaymentRequestDto,
} from 'src/common/dto/initiate-payment.dto';
import { Responsable } from 'src/common/utils/responsable';
import { PrincipalGuard } from 'src/guards/principal.guard';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('initiate')
  @UseGuards(PrincipalGuard)
  async initiate(
    @Body() data: InitiatePaymentRequestDto,
    @Res() res: Response,
    @Req() req,
  ) {
    const result = await this.paymentService.createPayment(req.user.id, data);

    return Responsable.sendSuccess(
      res,
      'Payment(s) successfully initiated, verify to continue',
      result,
    );
  }
}

import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { CreateRefundDto } from 'src/common/dto/create-refund.dto';
import { InitiatePaymentRequestDto } from 'src/common/dto/initiate-payment.dto';
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
    @Req() req: any,
  ) {
    const payment = await this.paymentService.createPayment(req.user.id, data);

    return Responsable.sendSuccess(
      res,
      'Payment(s) successfully initiated, verify to continue',
      { payment },
    );
  }

  @Post('refund')
  @UseGuards(PrincipalGuard)
  async refund(
    @Body() data: CreateRefundDto,
    @Res() res: Response,
    @Req() req: any,
  ) {
    const refund = await this.paymentService.createRefund({
      ...{ owner: req.user.id },
      ...data,
    });

    return Responsable.sendSuccess(
      res,
      'Refund(s) successfully initiated, verify to continue',
      { refund },
    );
  }
}

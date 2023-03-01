import { BadRequestException, Body, Controller, Get, HttpStatus, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Response } from 'express';
import mongoose from 'mongoose';
import { CreateRefundDto } from 'src/common/dto/create-refund.dto';
import { InitiatePaymentRequestDto } from 'src/common/dto/initiate-payment.dto';
import { Responsable } from 'src/common/utils/responsable';
import { PrincipalGuard } from 'src/guards/principal.guard';
import { PaymentService } from './payment.service';
import { VerifyPaymentService } from './verify-payment.service';

interface IGetPayment {
  userId: mongoose.Types.ObjectId;
  paymentId: mongoose.Types.ObjectId;
}

@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly verifyPaymentService: VerifyPaymentService,
  ) { }

  @Post('initiate')
  @UseGuards(PrincipalGuard)
  async initiate(
    @Body() data,
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

  @Get('verify/:id')
  @UseGuards(PrincipalGuard)
  async verify(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      const payment = await this.verifyPaymentService.verify(id)

      return Responsable.sendSuccess(res, 'Payment successully fetched', { payment })
    } catch (error) {
      if (error?.kind && error.kind === 'ObjectId') {
        throw new BadRequestException('Invalid payment or refund ID.')
      }

      throw error
    }
  }

  @MessagePattern({ role: 'payments', cmd: 'get' }) 
  async find(data: IGetPayment) {
    try {
      const payments = await this.paymentService.findAll(this.getQuery(data));

      if (data.paymentId) {
        if (payments.length === 0) {
          return Responsable.sendRpcError(
            'Payment not found or does not belong to you.',
            HttpStatus.NOT_FOUND,
          );
        }

        return Responsable.sendRpcSuccess(
          'Payment reteived successfully',
          payments.shift(),
        );
      }

      return Responsable.sendRpcSuccess('User payments retreived', payments);
    } catch (error) {
      if (!(error instanceof Error)) {
        throw new Error(error.message);
      }

      return;
    }
  }

  private getQuery(data: IGetPayment) {
    const query = data.paymentId
      ? {
          _id: data.paymentId,
          user: this.getOwnerObjectFromString(data.userId),
        }
      : { user: this.getOwnerObjectFromString(data.userId) };

    return query;
  }

  private getOwnerObjectFromString(
    id: mongoose.Types.ObjectId,
  ): mongoose.Types.ObjectId {
    return new mongoose.Types.ObjectId(id);
  }
}

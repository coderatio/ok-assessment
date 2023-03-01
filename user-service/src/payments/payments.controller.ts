import { Controller, Get, Param, Req, Res, UseGuards } from '@nestjs/common';
import { Responsable } from 'src/common/utils/responsable';
import { PrincipalGuard } from 'src/guards/principal.guard';
import { PaymentsService } from './payments.service';
import { Request, Response } from 'express';

@Controller('payments')
export class PaymentsController {
    constructor(
        private readonly paymentService: PaymentsService,
    ) { }

    @Get(':id?')
    @UseGuards(PrincipalGuard)
    async find(
        @Param('id') id: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        try {
            const userId = (req.user as any).id;
            const query = id ? { paymentId: id, userId } : { userId };

            const response = await this.paymentService.findAll(query);
            if (response?.error) {
                return Responsable.sendError(res, response.message, response.code);
            }

            return Responsable.sendSuccess(res, response.message, response.data);
        } catch (error) {
            if (!(error instanceof Error)) {
                throw new Error(error.message);
            }

            return Responsable.sendError(res, 'Failed to get payment(s).');
        }
    }
}


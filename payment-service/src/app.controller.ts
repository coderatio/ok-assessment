import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Responsable } from './common/utils/responsable';
import { Response } from '@nestjs/common';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  index(@Response() res) {
    return Responsable.sendSuccess(res, this.appService.getHello());
  }
}

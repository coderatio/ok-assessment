import { Controller, Logger, Post, Req, Res, UseGuards } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local.guard';
import { Request, Response } from 'express';
import { Responsable } from 'src/common/utils/responsable';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger('AuthController');
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request, @Res() res: Response) {
    const user = await this.authService.login(req.user);

    return Responsable.sendSuccess(res, 'Loggedin successfully', user);
  }

  @MessagePattern({ role: 'auth', cmd: 'check' })
  async loggedIn(data: { jwt: string }) {
    try {
      return this.authService.validateToken(data.jwt);
    } catch (e) {
      this.logger.log(e);

      return false;
    }
  }
}

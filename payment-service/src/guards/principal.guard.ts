import { CanActivate, ExecutionContext, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { timeout } from 'rxjs';
import { AUTH_SERVICE } from 'src/common/constants';

export class PrincipalGuard implements CanActivate {
  private readonly logger = new Logger('AuthError');
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly client: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    try {
      const token = req.headers['authorization']?.split(' ')[1];
      const pattern = { role: 'auth', cmd: 'check' };

      const tokenValidationResult: any = await new Promise((resolve) => {
        this.client
          .send(pattern, { jwt: token })
          .pipe(timeout(5000))
          .subscribe((result) => resolve(result));
      });

      if (!tokenValidationResult) {
        return false;
      }

      req.user = tokenValidationResult.user;

      return true;
    } catch (err) {
      this.logger.error(err);
      return false;
    }
  }
}

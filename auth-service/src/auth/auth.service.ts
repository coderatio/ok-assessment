import { Inject, Logger, RequestTimeoutException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { compareSync } from 'bcrypt';
import { catchError, throwError, timeout, TimeoutError } from 'rxjs';

export class AuthService {
  constructor(
    @Inject('USER_SERVICE')
    private readonly client: ClientProxy,
    private readonly jwtService: JwtService,
  ) { }

  async validateUser(username: string, password: string): Promise<any> {
    try {
      const user: any = await new Promise((resolve) => {
        this.client
          .send({ role: 'user', cmd: 'get' }, { email: username })
          .pipe(
            timeout(5000),
            catchError((err) => {
              if (err instanceof TimeoutError) {
                return throwError(() => new RequestTimeoutException());
              }
              return throwError(() => err);
            }),
          )
          .subscribe((result) => resolve(result));
      });

      if (!user) {
        return null;
      }

      if (compareSync(password, user?.password)) {
        return user;
      }

      return null;
    } catch (e) {
      Logger.log(e);
      throw e;
    }
  }

  public async login(user: any) {
    const payload = { user, sub: user.id };

    return {
      userId: user.id,
      email: user.email,
      accessToken: this.jwtService.sign(payload),
    };
  }

  public validateToken(jwt: string) {
    return this.jwtService.verify(jwt);
  }
}

import {
  CallHandler,
  ExecutionContext,
  GatewayTimeoutException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, TimeoutError, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly timeoutInMillis: number) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(this.timeoutInMillis),
      catchError((err: unknown) => {
        if (err instanceof TimeoutError) {
          throw new GatewayTimeoutException('Gateway timeout has occurred');
        }
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        return throwError(() => new Error(errorMessage));
      }),
    );
  }
}

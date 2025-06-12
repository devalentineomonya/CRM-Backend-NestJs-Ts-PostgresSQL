import {
  CallHandler,
  ExecutionContext,
  GatewayTimeoutException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly timeoutInMillis: number) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(this.timeoutInMillis),
      catchError((err: unknown) => {
        // Only transform TimeoutError; let all other errors bubble up
        if (err instanceof TimeoutError) {
          throw new GatewayTimeoutException('Gateway timeout has occurred');
        }

        // Re-throw original error for the global exception filter to handle
        throw err;
      }),
    );
  }
}

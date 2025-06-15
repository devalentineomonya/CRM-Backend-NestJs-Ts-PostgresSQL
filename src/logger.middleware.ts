import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logger } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const { method, headers, ip } = req;

    const fullPath = req.originalUrl.split('?')[0]; // Strips query string

    this.logger.log({
      method,
      path: fullPath,
      userAgent: headers['user-agent'] || 'Unknown',
      ip,
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const originalEnd = res.end.bind(res);

    res.end = (...args: any[]) => {
      const duration = Date.now() - startTime;

      this.logger.log({
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      return originalEnd.apply(res, args);
    };

    next();
  }
}

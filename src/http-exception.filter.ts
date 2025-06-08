import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string;
  details?: any;
}

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const responseObj: ErrorResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: 'Internal Server Error',
    };

    // Handle HttpException (including duck-typed versions)
    if (
      exception instanceof HttpException ||
      (typeof exception === 'object' &&
        exception !== null &&
        'getStatus' in exception &&
        typeof (exception as { getStatus: () => number }).getStatus ===
          'function')
    ) {
      const httpException = exception as {
        getStatus: () => number;
        getResponse: () => string | object;
      };

      responseObj.statusCode = httpException.getStatus();
      const exceptionResponse = httpException.getResponse();

      if (typeof exceptionResponse === 'string') {
        responseObj.message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        // Handle response objects
        if (
          typeof exceptionResponse === 'object' &&
          exceptionResponse !== null &&
          'message' in exceptionResponse
        ) {
          responseObj.message = (
            exceptionResponse as { message: string }
          ).message;
        } else {
          responseObj.message = 'Error';
        }

        if (
          typeof exceptionResponse === 'object' &&
          exceptionResponse !== null &&
          'error' in exceptionResponse
        ) {
          responseObj.details = (exceptionResponse as { error: string }).error;
        } else {
          responseObj.details = undefined;
        }
      }
    }

    // Handle ForbiddenException with custom messages
    if (exception instanceof ForbiddenException) {
      responseObj.statusCode = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'string') {
        responseObj.message = response;
      } else if (typeof response === 'object' && response !== null) {
        const typedResponse = response as { error?: string };
        responseObj.details = typedResponse.error || 'Insufficient permissions';
      }
    }

    // Handle other exception types
    else if (exception instanceof QueryFailedError) {
      responseObj.statusCode = HttpStatus.BAD_REQUEST;
      responseObj.message = 'Database query failed';
      responseObj.details = exception.message;
    } else if (exception instanceof Error) {
      responseObj.message = exception.message;
      if (process.env.NODE_ENV === 'development') {
        responseObj.details = exception.stack;
      }
    }

    // Log only 500+ errors
    if (responseObj.statusCode >= 500) {
      console.error(`[${responseObj.timestamp}] ERROR:`, exception);
    }

    response.status(responseObj.statusCode).json(responseObj);
  }
}

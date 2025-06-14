import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import * as basicAuth from 'express-basic-auth';
import { TimeoutInterceptor } from './timeout-intercepter';
import { PrometheusController } from '@willsoto/nestjs-prometheus';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  Reflect.defineMetadata('isPublic', true, PrometheusController);
  app.use(helmet());

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const { httpAdapter } = app.get(HttpAdapterHost);

  app.useGlobalInterceptors(new TimeoutInterceptor(10000));

  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  // Swagger configuration
  const config = new DocumentBuilder()
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'jwt-access-token',
    })

    .setTitle('CRM System')
    .setDescription(
      'A comprehensive Customer Relationship Management (CRM) System to manage user interactions, quotes, and tickets effectively.',
    )
    .setVersion('1.0')
    .addTag('CRM')
    .build();

  // Protect Swagger endpoints in non-development environments
  const swaggerUser =
    configService.get<string>('SWAGGER_USER') || 'defaultUser';
  const swaggerPass =
    configService.get<string>('SWAGGER_PASS') || 'defaultPass';

  app.use(
    ['/api', '/api-json'],
    basicAuth({
      challenge: true,
      users: { [swaggerUser]: swaggerPass },
      realm: 'Swagger Documentation',
    }),
  );

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'none',
      operationsSorter: 'none',
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      tryItOutEnabled: true,
    },

    customSiteTitle: 'CRM System API Documentation',
    customCss: '.topbar { display: none; }',
  });

  const PORT = configService.get<number>('PORT') || 3000;
  await app.listen(PORT);
}

bootstrap();

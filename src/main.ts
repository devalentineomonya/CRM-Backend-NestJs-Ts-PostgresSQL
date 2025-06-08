import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const { httpAdapter } = app.get(HttpAdapterHost);
  const configService = app.get(ConfigService);

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

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  const PORT = configService.getOrThrow<number>('PORT');

  await app.listen(PORT ?? 3000);
}

bootstrap();

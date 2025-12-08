import * as dotenv from 'dotenv';
dotenv.config();
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import morgan from 'morgan';
import basicAuth from 'express-basic-auth';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(morgan('dev'));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      stopAtFirstError: true,
    }),
  );

  // 🔐 Protect Swagger Docs with Login Popup
  app.use(
    ['/api/docs', '/api/docs-json'],
    basicAuth({
      challenge: true,
      users: {
        admin: 'password123', 
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Auth API')
    .setDescription('Authentication Endpoints')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.PORT) || 3010;
  await app.listen(port, () => {
    console.log(`🚀 Server running: http://localhost:${port}`);
    console.log(`📄 Swagger Docs: http://localhost:${port}/api/docs`);
  });
}

bootstrap();

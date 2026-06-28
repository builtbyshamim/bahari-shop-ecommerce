import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { swaggerConfig } from './config/swagger.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe, VersioningType } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());

  // 2. CORS Configuration
  app.enableCors({
    origin: [
      'http://localhost:5173', // Apnar local frontend development port
      'http://localhost:3000',
      'https://kcommerce-admin.vercel.app',
      'https://www.kcommerce-admin.vercel.app',
      'https://kcommerce-seven.vercel.app',
      'https://www.kcommerce-seven.vercel.app',
      'https://bahari-shop-solvexbd.vercel.app',
      'https://www.bahari-shop-solvexbd.vercel.app',
      'https://bahari-shop-solvexbd-admin.vercel.app',
      'https://www.bahari-shop-solvexbd-admin.vercel.app',
      'https://bahari-shop.solvexbd.com',
      'https://bahari-shop-admin.solvexbd.com',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Jodi cookie ba authorization header pathate chan
  });

  // Global prefix
  const apiPrefix = 'api';
  app.setGlobalPrefix(apiPrefix);
  // Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());
  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );
  // Swagger documentation
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);
  const port = configService.get('PORT') || 5000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}
bootstrap();

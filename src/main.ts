import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpStatus, ValidationError, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ExceptionResponse } from './exceptions/common.exception';
import { UtilCommonTemplate } from './utils/utils.common';
import { ValidationFilter } from './filters/validation.filter';
import { HttpLoggerInterceptor } from './interceptors/http-logger.interceptor';
import * as cookieParser from 'cookie-parser';
import { CONFIG_SERVICE } from './constants';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: true,
  });
  // app.enableCors({
  //   origin: process.env.WHITELIST_IPS.split(','), // add your IP whitelist here
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  //   preflightContinue: false,
  //   optionsSuccessStatus: 204,
  //   credentials: true,
  //   allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization',
  // });
  app.enableCors({ origin: ['http://localhost:3000', 'http://192.168.15.187:3000', 'http://192.168.15.101:3000', '*'], credentials: true});
  app.use(cookieParser());
  app.setGlobalPrefix(process.env.API_PREFIX);
  app.useGlobalInterceptors(new HttpLoggerInterceptor());

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Stock Swagger')
    .setDescription('Stock API - Talented Investor')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'Stock Swagger',
  });

  app.useGlobalFilters(new ValidationFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory(errors: ValidationError[]) {
        return new ExceptionResponse(
          HttpStatus.BAD_REQUEST,
          UtilCommonTemplate.getMessageValidator(errors),
        );
      },
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.connectMicroservice(app.get(CONFIG_SERVICE).createKafkaConfig());
  await app.startAllMicroservices().catch((e) => console.log(e));

  await app.listen(parseInt(process.env.SERVER_PORT)).then(() => {
    console.log(
      `Server is running at ${process.env.SERVER_HOST}:${process.env.SERVER_PORT} --version: 0.1.17`,
    );
  });
}

bootstrap();

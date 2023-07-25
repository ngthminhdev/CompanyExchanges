import { Module } from '@nestjs/common';
import { MinioController } from './minio.controller';
import { MinioOptionService } from './minio.service';

@Module({
  controllers: [MinioController],
  providers: [MinioOptionService],
  exports: [MinioOptionService]
})
export class MinioOptionModule { }

import { Controller, Get } from '@nestjs/common';
import { MinioService } from 'nestjs-minio-client';

@Controller('minio')
export class MinioController {
  constructor(private readonly minioService: MinioService) {}

  @Get()
  listBucket() {
    return this.minioService.client.listBucket();
  }

  @Get('todo')
  async listTodo(){
  }


}

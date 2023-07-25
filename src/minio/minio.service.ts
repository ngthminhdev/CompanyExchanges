import { Injectable } from '@nestjs/common';
import { MinioService } from 'nestjs-minio-client';

@Injectable()
export class MinioOptionService {
  constructor(
    private readonly minio: MinioService,
  ){}

  async listBucket(){
    return await this.minio.client.listBuckets();
  }

  async put(bucket: string, name: string, buffer: Buffer, metaData: any){
    await this.minio.client.putObject(bucket, name, buffer, metaData)
  }
}

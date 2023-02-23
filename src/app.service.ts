import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @InjectDataSource()
    private readonly manager: DataSource,
  ) {}

  async getHello(): Promise<any> {
    const data = await this.manager.query('select top(10) * from SOLENH_ver1');
    console.log(data);
    return 'Hello World!';
  }
}

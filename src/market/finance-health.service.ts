import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { DB_SERVER } from '../constants';
import { InjectDataSource } from '@nestjs/typeorm';
import { MssqlService } from '../mssql/mssql.service';
import { DataSource } from 'typeorm';
import { UtilCommonTemplate } from '../utils/utils.common';
import { RedisKeys } from '../enums/redis-keys.enum';

@Injectable()
export class FinanceHealthService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly redis: Cache,
    @InjectDataSource(DB_SERVER) private readonly dbServer: DataSource,
    private readonly mssqlService: MssqlService,
  ) {}

  async PEIndustry(
    ex: string,
    industries: string[],
    type: number,
    order: number,
  ) {
    const inds: string = UtilCommonTemplate.getIndustryFilter(industries);
    const floor = ex == 'ALL' ? ` ('HOSE', 'HNX', 'UPCOM') ` : ` ('${ex}') `;
    const redisData = await this.redis.get(
      `${RedisKeys.PEIndustry}:${floor}:${inds}:${order}:${type}`,
    );
    // if (redisData) return redisData;

    const date = UtilCommonTemplate.getPastDate(type, order);

    const { startDate, dateFilter } = UtilCommonTemplate.getDateFilter(date);

    const query = `
    
    
    `;
  }

  async PBIndustry(
    ex: string,
    industries: string[],
    type: number,
    order: number,
  ) {}
}

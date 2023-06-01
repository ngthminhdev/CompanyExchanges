import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { DataSource } from 'typeorm';
import { DB_SERVER } from '../constants';
import { RedisKeys } from '../enums/redis-keys.enum';
import { MssqlService } from '../mssql/mssql.service';
import { UtilCommonTemplate } from '../utils/utils.common';
import { IndusValueInterface } from './interfaces/indus-value.interface';
import { IndusValueResponse } from './responses/indus-value.response';

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

    const { dateFilter } = UtilCommonTemplate.getDateFilter(date);

    const query = `
        select i.LV2 as industry, r.date, avg(r.value) as value
        from RATIO.dbo.ratio r
        inner join marketInfor.dbo.info i
            on i.code = r.code
        where i.floor in ${floor}
            and i.type in ('STOCK', 'ETF')
            and r.date in ${dateFilter}
            and i.LV2 in ${inds}
            and r.ratioCode = 'PRICE_TO_EARNINGS'
        group by i.LV2, r.date
        order by r.date
    `;

    const data = await this.mssqlService.query<IndusValueInterface[]>(query);

    const mappedData = new IndusValueResponse().mapToList(data);

    return mappedData;
  }

  async PBIndustry(
    ex: string,
    industries: string[],
    type: number,
    order: number,
  ) {}
}

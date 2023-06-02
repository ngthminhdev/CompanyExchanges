import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { DataSource } from 'typeorm';
import { DB_SERVER } from '../constants';
import { RedisKeys } from '../enums/redis-keys.enum';
import { MssqlService } from '../mssql/mssql.service';
import { UtilCommonTemplate } from '../utils/utils.common';
import { IndusValueInterface } from './interfaces/indus-value.interface';
import { ISPEPBIndustry } from './interfaces/pe-pb-industry-interface';
import { MarketService } from './market.service';
import { IndusValueResponse } from './responses/indus-value.response';
import { PEBResponse } from './responses/peb-ticker.response';
import { PEPBIndustryResponse } from './responses/pepb-industry.response';

@Injectable()
export class FinanceHealthService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly redis: Cache,
    @InjectDataSource(DB_SERVER) private readonly dbServer: DataSource,
    private readonly mssqlService: MssqlService,
    private readonly marketService: MarketService,
  ) {}

  async PEPBIndustry(ex: string, type: number, order: number) {
    const floor = ex == 'ALL' ? ` ('HOSE', 'HNX', 'UPCOM') ` : ` ('${ex}') `;
    const redisData = await this.redis.get(
      `${RedisKeys.PEPBIndustry}:${floor}:${order}:${type}`,
    );
    if (redisData) return redisData;

    const date = UtilCommonTemplate.getPastDate(type, order);

    const { dateFilter } = UtilCommonTemplate.getDateFilter(date);

    const query = `
      with valueData as (
          select
              [code], 
              [date],
              [ratioCode],
              [value]
          from RATIO.dbo.ratio
          where
          ratioCode in ('PRICE_TO_BOOK', 'PRICE_TO_EARNINGS')
          and date in ${dateFilter}
      )
      select [LV2] industry, [date], [PRICE_TO_BOOK] PB, [PRICE_TO_EARNINGS] PE
      from (
          select [LV2], [date], [ratioCode], value
          from valueData v
          inner join marketInfor.dbo.info i
                  on i.code = v.code
              where i.LV2 != ''
                  and i.floor in ${floor}
                  and i.type in ('STOCK', 'ETF')
                  and i.status = 'listed'
      --     group by LV2, ratioCode, [date]
      ) as srouces
      pivot (
          avg(value)
          for ratioCode in ([PRICE_TO_BOOK], [PRICE_TO_EARNINGS])
      ) as pvTable
    `;

    const data = await this.mssqlService.query<ISPEPBIndustry[]>(query);

    const mappedData = new PEPBIndustryResponse().mapToList(data);

    await this.redis.set(
      `${RedisKeys.PEPBIndustry}:${floor}:${order}:${type}`,
      mappedData,
    );

    return mappedData;
  }

  async PETicker(ex: string, industries: string[]) {
    const floor = ex == 'ALL' ? ` ('HOSE', 'HNX', 'UPCOM') ` : ` ('${ex}') `;
    const inds: string = UtilCommonTemplate.getIndustryFilter(industries);

    const redisData = await this.redis.get(
      `${RedisKeys.PETicker}:${floor}:${inds}`,
    );
    if (redisData) return redisData;

    const date = UtilCommonTemplate.getPastDate(5);

    const startDate = await this.marketService.getNearestDate(
      'marketTrade.dbo.tickerTradeVND',
      date[4],
    );

    const endDate = await this.marketService.getNearestDate(
      'marketTrade.dbo.tickerTradeVND',
      date[0],
    );

    const query: string = `
      with codeData as (select t.code,
                              date,
                              closePrice,
                              lead(closePrice) over (
                                  partition by t.code
                                  order by date desc
                                  ) as prevClosePrice
                        from marketTrade.dbo.tickerTradeVND t
                                inner join marketInfor.dbo.info i on t.code = i.code
                        where i.floor in ${floor}
                          and i.type in ('STOCK', 'ETF')
                          and i.status = 'listed'
                          and date in ('${startDate}', '${endDate}')),
          epsVNDData as (select c.date, c.code, r.value as epsVND
                          from codeData c
                                  inner join RATIO.dbo.ratio r
                                              on c.code = r.code
                          where r.ratioCode = 'EPS_TR'
                            and r.date = '${date[0]}'),
          valData as (select t.code,
                              t.date,
                              t.totalVal,
                              row_number() over (
                                  partition by t.code
                                  order by t.date desc
                                  ) as rn
                      from marketTrade.dbo.tickerTradeVND t
                          inner join epsVNDData e
                          on t.code = e.code
                      ),
          avgVal as (select code, avg(totalVal) as avgTotalVal
                      from valData
                      where rn <= 50
                      group by code
                      )
      select top 50 c.code,
            c.date,
            e.epsVND,
            a.avgTotalVal,
            (c.closePrice - c.prevClosePrice) / c.prevClosePrice * 100 as pricePerChange
      from codeData c
              inner join epsVNDData e
                          on c.code = e.code and c.date = e.date
              inner join avgVal a on c.code = a.code
      order by 2 desc, 3 desc
    `;

    const data = await this.mssqlService.query<any[]>(query);

    const mappedData = new PEBResponse().mapToList(data);

    await this.redis.set(`${RedisKeys.PETicker}:${floor}:${inds}`, mappedData);

    return mappedData;
  }

  async PBIndustry(
    ex: string,
    industries: string[],
    type: number,
    order: number,
  ) {
    const inds: string = UtilCommonTemplate.getIndustryFilter(industries);
    const floor = ex == 'ALL' ? ` ('HOSE', 'HNX', 'UPCOM') ` : ` ('${ex}') `;
    const redisData = await this.redis.get(
      `${RedisKeys.PBIndustry}:${floor}:${inds}:${order}:${type}`,
    );
    if (redisData) return redisData;

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

    await this.redis.set(
      `${RedisKeys.PBIndustry}:${floor}:${inds}:${order}:${type}`,
      mappedData,
    );

    return mappedData;
  }
}

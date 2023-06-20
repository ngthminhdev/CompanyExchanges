import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { TimeToLive } from '../enums/common.enum';
import { RedisKeys } from '../enums/redis-keys.enum';
import { MssqlService } from '../mssql/mssql.service';
import { IIndustryGDPValue } from './interfaces/industry-gdp-value.interface';
import { GDPResponse } from './responses/gdp.response';

@Injectable()
export class MacroService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly redis: Cache,
    private readonly mssqlService: MssqlService,
  ) {}

  async industryGDPValue(): Promise<GDPResponse[]> {
    const redisData = await this.redis.get<GDPResponse[]>(
      RedisKeys.industryGDPValue,
    );
    if (redisData) return redisData;

    const query: string = `
        SELECT  [chiTieu]   as [name]
                ,[thoiDiem] as [date]
                ,[giaTri]   as [value]
        FROM [macroEconomic].[dbo].[EconomicVN]
        WHERE chiTieu IN ( 
            N'Giá trị GDP (2010) : Công nghiệp (Tỷ VNĐ)', 
            N'Giá trị GDP (2010) : Dịch vụ (Tỷ VNĐ)', 
            N'Giá trị GDP (2010) : Nông nghiệp (Tỷ VNĐ)' 
        )
        AND thoiDiem >= '2013-01-01'
        ORDER BY chiTieu, thoiDiem; 
    `;

    const data = await this.mssqlService.query<IIndustryGDPValue[]>(query);

    const mappedData = new GDPResponse().mapToList(data);

    await this.redis.set(RedisKeys.industryGDPValue, mappedData, {
      ttl: TimeToLive.OneWeek,
    });

    return mappedData;
  }

  async gdpPrice(): Promise<GDPResponse[]> {
    const redisData = await this.redis.get<GDPResponse[]>(
      RedisKeys.gdpPrice,
    );
    if (redisData) return redisData;

    const query: string = `
        SELECT  [chiTieu] as name
            ,[thoiDiem] as date
            ,[giaTri]   as value
        FROM [macroEconomic].[dbo].[EconomicVN]
        WHERE chiTieu IN ( 
            N'GDP theo giá cố định (2010) (Tỷ VNĐ)', 
            N'GDP theo giá hiện hành (Tỷ VNĐ)'
        )
        AND thoiDiem >= '2013-01-01'
        ORDER BY chiTieu, thoiDiem; 
    `;

    const data = await this.mssqlService.query<IIndustryGDPValue[]>(query);

    const mappedData = new GDPResponse().mapToList(data);

    await this.redis.set(RedisKeys.gdpPrice, mappedData, {
      ttl: TimeToLive.OneWeek,
    });

    return mappedData;
  }
}

import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { TimeToLive } from '../enums/common.enum';
import { RedisKeys } from '../enums/redis-keys.enum';
import { MssqlService } from '../mssql/mssql.service';
import { UtilCommonTemplate } from '../utils/utils.common';
import { IIndustryGDPValue } from './interfaces/industry-gdp-value.interface';
import { GDPResponse } from './responses/gdp.response';
import moment from 'moment';

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
        FROM [macroEconomic].[dbo].[DuLieuViMo]
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
    const redisData = await this.redis.get<GDPResponse[]>(RedisKeys.gdpPrice);
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

  async idustryGDPContibute(): Promise<GDPResponse[]> {
    const redisData = await this.redis.get<GDPResponse[]>(
      RedisKeys.idustryGDPContibute,
    );
    if (redisData) return redisData;

    const query: string = `
        WITH groupData AS
        (
            SELECT  [chiTieu]  AS [name]
                ,[thoiDiem] AS [date]
                ,[giaTri]   AS [value]
            FROM [macroEconomic].[dbo].[DuLieuViMo]
            WHERE [chiTieu] IN ( N'Giá trị GDP (2010) : Công nghiệp (Tỷ VNĐ)', N'Giá trị GDP (2010) : Dịch vụ (Tỷ VNĐ)', N'Giá trị GDP (2010) : Nông nghiệp (Tỷ VNĐ)' )
            AND [thoiDiem] >= '2013-01-01' 
        ), cancultaedData AS
        (
            SELECT  [name]
                ,[date]
                ,(SUM([value])over( PARTITION by [name],[date] ) / sum ([value]) over( PARTITION by [date] )) * 100 AS value
            FROM groupData
        )
        SELECT  [name]
            ,[date]
            ,[value]
        FROM cancultaedData
        ORDER BY [name], [date];
    `;

    const data = await this.mssqlService.query<IIndustryGDPValue[]>(query);

    const mappedData = new GDPResponse().mapToList(data);

    await this.redis.set(RedisKeys.idustryGDPContibute, mappedData, {
      ttl: TimeToLive.OneWeek,
    });

    return mappedData;
  }

  async idustryGDPGrowth(order: number): Promise<GDPResponse[]> {
    const redisData = await this.redis.get<GDPResponse[]>(
      `${RedisKeys.idustryGDPGrowth}:${order}`,
    );
    if (redisData) return redisData;

    const date = UtilCommonTemplate.getPastDateV2(2, order);

    const { dateFilter } = UtilCommonTemplate.getDateFilterV2(date);

    const query: string = `
        SELECT  [chiTieu]     AS [name]
            ,[thoiDiem]    AS [date]
            ,AVG([giaTri]) AS [value]
        FROM [macroEconomic].[dbo].[DuLieuViMo]
        WHERE phanBang = 'GDP'
        AND thoiDiem IN ${dateFilter}
        AND nhomDulieu = N'Tăng trưởng GDP theo giá 2010'
        GROUP BY  [chiTieu]
                ,[thoiDiem]
        ORDER BY [name]
                ,[date]
    `;

    const data = await this.mssqlService.query<IIndustryGDPValue[]>(query);

    const mappedData = new GDPResponse().mapToList(data);

    await this.redis.set(`${RedisKeys.idustryGDPGrowth}:${order}`, mappedData, {
      ttl: TimeToLive.OneWeek,
    });

    return mappedData as any;
  }

  async idustryGDPGrowthPercent(): Promise<GDPResponse[]> {
    const redisData = await this.redis.get<GDPResponse[]>(
      RedisKeys.idustryGDPGrowthPercent,
    );
    if (redisData) return redisData;

    const query: string = `
        SELECT  [chiTieu]  AS [name]
              ,[thoiDiem] AS [date]
              ,([giaTri] - lag([giaTri]) over ( partition by [chiTieu] ORDER BY [thoiDiem] )) 
                      / lag(ABS([giaTri])) over ( partition by [chiTieu] ORDER BY [thoiDiem] ) AS [value]
        FROM [macroEconomic].[dbo].[DuLieuViMo]
        WHERE [thoiDiem] >= '2013-03-01 00:00:00.000'
        AND phanBang = 'GDP'
        AND [chiTieu] IN ( 
              N'Công nghiệp chế biến, chế tạo', 
              N'Hoạt động kinh doanh bất động sản ', 
              N'Vận tải, kho bãi', N'Xây dựng', 
              N'Khai khoáng',
              N'Bán buôn và bán lẻ; sửa chữa ô tô, mô tô, xe máy và xe có động cơ khác ' )
        ORDER BY [name] , [date];
    `;

    const data = await this.mssqlService.query<IIndustryGDPValue[]>(query);

    const mappedData = new GDPResponse().mapToList(data);

    await this.redis.set(RedisKeys.idustryGDPGrowthPercent, mappedData, {
      ttl: TimeToLive.OneWeek,
    });

    return mappedData;
  }

  async idustryCPIPercent(): Promise<GDPResponse[]> {
    const redisData = await this.redis.get<GDPResponse[]>(
      RedisKeys.idustryCPIPercent,
    );
    if (redisData) return redisData;

    const query: string = `
      SELECT  [chiTieu]  AS [name]
            ,[thoiDiem] AS [date]
            ,[giaTri]   AS [value]
      FROM [macroEconomic].[dbo].[DuLieuViMo]
      WHERE phanBang = N'CHỈ SỐ GIÁ TIÊU DÙNG'
      AND [thoiDiem] >= '2018-01-01'
      AND [chiTieu] in (
          N'Tăng trưởng CPI :Hàng ăn và dịch vụ ăn uốngMoM (%)',
          N'Tăng trưởng CPI :Nhà ở và vật liệu xây dựngMoM (%)',
          N'Tăng trưởng CPI :Thiết bị và đồ dùng gia đìnhMoM (%)',
          N'Tăng trưởng CPI :Giao thôngMoM (%)',
          N'Tăng trưởng CPI :Giáo dụcMoM (%)'
      )
      ORDER BY [chiTieu], [thoiDiem];
    `;

    const data = await this.mssqlService.query<IIndustryGDPValue[]>(query);

    const mappedData = new GDPResponse().mapToList(data);

    await this.redis.set(RedisKeys.idustryCPIPercent, mappedData, {
      ttl: TimeToLive.OneWeek,
    });

    return mappedData;
  }

  async idustryCPITable(): Promise<GDPResponse[]> {
    const redisData = await this.redis.get<GDPResponse[]>(
      RedisKeys.idustryCPITable,
    );
    if (redisData) return redisData;

    const query: string = `
      SELECT  [chiTieu]  AS [name]
            ,[thoiDiem] AS [date]
            ,[giaTri]   AS [value]
      FROM [macroEconomic].[dbo].[DuLieuViMo]
      WHERE phanBang = N'CHỈ SỐ GIÁ TIÊU DÙNG'
      AND [thoiDiem] >= '2018-01-01'
      AND [chiTieu] in (
          N'Tăng trưởng CPI CPI :Chỉ số giá tiêu dùngMoM (%)',
          N'Tăng trưởng CPI :Lương thựcMoM (%)',
          N'Tăng trưởng CPI :Thực phẩmMoM (%)'
      )
      ORDER BY [chiTieu], [thoiDiem];
    `;

    const data = await this.mssqlService.query<IIndustryGDPValue[]>(query);

    const mappedData = new GDPResponse().mapToList(data);

    await this.redis.set(RedisKeys.idustryCPITable, mappedData, {
      ttl: TimeToLive.OneWeek,
    });

    return mappedData;
  }

  async idustryCPISameQuater(): Promise<GDPResponse[]> {
    const redisData = await this.redis.get<GDPResponse[]>(
      RedisKeys.idustryCPISameQuater,
    );
    if (redisData) return redisData;

    const date = UtilCommonTemplate.getPastDateV2(2, 1);

    const query: string = `
      SELECT  [chiTieu]  AS [name]
            ,[thoiDiem] AS [date]
            ,[giaTri]   AS [value]
      FROM [macroEconomic].[dbo].[DuLieuViMo]
      WHERE phanBang = N'CHỈ SỐ GIÁ TIÊU DÙNG'
      AND [thoiDiem] >= '${moment(date[1])
        .startOf('year')
        .format('YYYY-MM-DD')}' 
      AND [thoiDiem] <= '${moment(date[0])
        .startOf('year')
        .format('YYYY-MM-DD')}'
      AND [chiTieu] = 
        N'Tăng trưởng CPI CPI :Chỉ số giá tiêu dùngMoM (%)'
      ORDER BY [chiTieu], [thoiDiem];
    `;

    const data = await this.mssqlService.query<IIndustryGDPValue[]>(query);

    const mappedData = new GDPResponse().mapToList(data);

    await this.redis.set(RedisKeys.idustryCPISameQuater, mappedData, {
      ttl: TimeToLive.OneWeek,
    });

    return mappedData;
  }

  async idustryCPIChange(order: number): Promise<GDPResponse[]> {
    const redisData = await this.redis.get<GDPResponse[]>(
      `${RedisKeys.idustryCPIChange}:${order}`,
    );
    if (redisData) return redisData;

    const date = UtilCommonTemplate.getPastDateV2(2, order);

    const { dateFilter } = UtilCommonTemplate.getDateFilterV2(date);

    const query: string = `
      SELECT  [chiTieu]  AS [name]
            ,[thoiDiem] AS [date]
            ,[giaTri]   AS [value]
      FROM [macroEconomic].[dbo].[DuLieuViMo]
      WHERE phanBang = N'CHỈ SỐ GIÁ TIÊU DÙNG'
      AND [thoiDiem] in ${dateFilter}
      AND [chiTieu] !=
          N'Tăng trưởng CPI CPI :Chỉ số giá tiêu dùngMoM (%)'
      ORDER BY [chiTieu], [thoiDiem];
    `;

    const data = await this.mssqlService.query<IIndustryGDPValue[]>(query);

    const mappedData = new GDPResponse().mapToList(data);

    await this.redis.set(`${RedisKeys.idustryCPIChange}:${order}`, mappedData, {
      ttl: TimeToLive.OneWeek,
    });

    return mappedData;
  }

  async cpiQuyenSo(): Promise<GDPResponse[]> {
    const redisData = await this.redis.get<GDPResponse[]>(
      RedisKeys.cpiQuyenSo,
    );
    if (redisData) return redisData;

    const query: string = `
      select
          [Các nhóm hàng và dịch vụ] as [name],
          sum([Giai đoạn 2020-2025]) as value
      from  [macroEconomic].[dbo].[quyenso]
      where [Mã] is not null
      group by [Các nhóm hàng và dịch vụ]
    `;

    const data = await this.mssqlService.query<IIndustryGDPValue[]>(query);

    const mappedData = new GDPResponse().mapToList(data);

    await this.redis.set(RedisKeys.cpiQuyenSo, mappedData, {
      ttl: TimeToLive.OneWeek,
    });

    return mappedData;
  }
}

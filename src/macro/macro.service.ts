import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as moment from 'moment';
import { TimeToLive, TimeTypeEnum } from '../enums/common.enum';
import { RedisKeys } from '../enums/redis-keys.enum';
import { MssqlService } from '../mssql/mssql.service';
import { UtilCommonTemplate } from '../utils/utils.common';
import { FDIOrderDto } from './dto/fdi-order.dto';
import { ForeignInvestmentIndexDto } from './dto/foreign-investment-index.dto';
import { IIndustryGDPValue } from './interfaces/industry-gdp-value.interface';
import { IPPIndusProductionIndexMapping, IPPIndustyMapping, IPPMostIndustryProductionMapping } from './mapping/ipp-industry.mapping';
import { AccumulatedResponse } from './responses/accumulated.response';
import { CorporateBondsIssuedSuccessfullyResponse } from './responses/corporate-bonds-issued-successfully.response';
import { ForeignInvestmentIndexResponse } from './responses/foreign-investment.response';
import { GDPResponse } from './responses/gdp.response';
import { LaborForceResponse } from './responses/labor-force.response';
import { TotalInvestmentProjectsResponse } from './responses/total-invesment-project.response';
import { TotalOutstandingBalanceResponse } from './responses/total-outstanding-balance.response';

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
      AND [thoiDiem] <= '${moment(date[0]).endOf('year').format('YYYY-MM-DD')}'
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
    const redisData = await this.redis.get<GDPResponse[]>(RedisKeys.cpiQuyenSo);
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

  private genIndustry(q: number){
    switch (q) {
      case 0:
        return 'Tăng trưởng: Toàn ngành công nghiệp (%)'
        case 1:
        return 'Tăng trưởng: Sản xuất và Phân phối điện (%)'
        case 2:
        return 'Tăng trưởng: Khai khoáng (%)'
        case 3:
        return 'Tăng trưởng: Cung cấp nước, hoạt động quản lý và xử lý rác thải, nước thải (%)'
        case 4:
        return 'Tăng trưởng: Công nghiệp chế biến, chế tạo (%)'
      default:
        break;
    }
  }

  async industrialIndex(q: number): Promise<GDPResponse[]> {
    const chiTieu = this.genIndustry(q)
    const redisData = await this.redis.get<GDPResponse[]>(
      `${RedisKeys.industrialIndex}:${q}`,
    );

    if (redisData) return redisData;

    const query: string = `
      SELECT  [chiTieu] as [name]
            ,[thoiDiem] as [date]
            ,[giaTri]    as[value]
      FROM [macroEconomic].[dbo].[DuLieuViMo]
      WHERE phanBang = N'CHỈ SỐ CÔNG NGHIỆP'
      AND chiTieu = N'${chiTieu}'
      AND nhomDuLieu = N'Tăng trưởng chung - cập nhập (MoM%)'
      AND thoiDiem >= '2013-01-01'
      ORDER BY thoiDiem;
    `;

    const data = await this.mssqlService.query<IIndustryGDPValue[]>(query);

    const mappedData = new GDPResponse().mapToList(data);

    await this.redis.set(`${RedisKeys.industrialIndex}:${q}`, mappedData, {
      ttl: TimeToLive.OneWeek,
    });

    return mappedData;
  }

  async industrialIndexTable(): Promise<GDPResponse[]> {
    const redisData = await this.redis.get<GDPResponse[]>(
      RedisKeys.industrialIndexTable,
    );
    if (redisData) return redisData;

    const query: string = `
      SELECT  [chiTieu] as [name]
            ,[thoiDiem] as [date]
            ,[giaTri]    as[value]
      FROM [macroEconomic].[dbo].[DuLieuViMo]
      WHERE phanBang = N'CHỈ SỐ CÔNG NGHIỆP'
      AND nhomDuLieu = N'Tăng trưởng chung - cập nhập (MoM%)'
      AND thoiDiem >= '2013-01-01'
      ORDER BY chiTieu desc, thoiDiem;
    `;

    const data = await this.mssqlService.query<IIndustryGDPValue[]>(query);

    const mappedData = new GDPResponse().mapToList(data);

    await this.redis.set(RedisKeys.industrialIndexTable, mappedData, {
      ttl: TimeToLive.OneWeek,
    });

    return mappedData;
  }

  async ippConsumAndInventory(industry: string): Promise<GDPResponse[]> {
    const industryFilter = IPPIndustyMapping[industry] || '';

    const redisData = await this.redis.get<GDPResponse[]>(
      `${RedisKeys.ippConsumAndInventory}:${industryFilter}`,
    );
    if (redisData) return redisData;

    const query: string = `
      SELECT 
          CASE 
              WHEN nhomDuLieu = N'CHỈ SỐ TIÊU THỤ SP CÔNG NGHIỆP (%)' THEN [chiTieu] + ' - TT'
              WHEN nhomDuLieu = N'CHỈ SỐ TỒN KHO SP CÔNG NGHIỆP (%)' THEN [chiTieu] + ' - TK'
              ELSE [chiTieu]
          END AS [name],
          [thoiDiem] AS [date],
          [giaTri] AS [value]
      FROM [macroEconomic].[dbo].[DuLieuViMo]
      WHERE phanBang = N'CHỈ SỐ CÔNG NGHIỆP'
          AND nhomDuLieu IN (
              N'CHỈ SỐ TIÊU THỤ SP CÔNG NGHIỆP (%)',
              N'CHỈ SỐ TỒN KHO SP CÔNG NGHIỆP (%)'
          )
          AND thoiDiem >= '2013-01-01'
      AND [chiTieu] = ${industryFilter}

      ORDER BY [chiTieu], [thoiDiem];
    `;

    const data = await this.mssqlService.query<IIndustryGDPValue[]>(query);

    const mappedData = new GDPResponse().mapToList(data);

    await this.redis.set(
      `${RedisKeys.ippConsumAndInventory}:${industryFilter}`,
      mappedData,
      {
        ttl: TimeToLive.OneWeek,
      },
    );

    return mappedData;
  }

  async ippIndusProductionIndex(industry: string): Promise<GDPResponse[]> {
    const industryFilter = IPPIndusProductionIndexMapping[industry] || '';

    const redisData = await this.redis.get<GDPResponse[]>(
      `${RedisKeys.ippIndusProductionIndex}:${industryFilter}`,
    );
    if (redisData) return redisData;

    const query: string = `
      SELECT 
          [chiTieu] as [name],
          [thoiDiem] AS [date],
          [giaTri] AS [value]
      FROM [macroEconomic].[dbo].[DuLieuViMo]
      WHERE phanBang = N'CHỈ SỐ CÔNG NGHIỆP'
          AND nhomDuLieu = N'CHỈ SỐ SẢN XUẤT CÔNG NGHIỆP THEO NGÀNH CÔNG NGHIỆP (%)'
          AND thoiDiem >= '2013-01-01'
      AND [chiTieu] = ${industryFilter}
      ORDER BY [chiTieu] DESC, [thoiDiem];

    `;

    const data = await this.mssqlService.query<IIndustryGDPValue[]>(query);

    const mappedData = new GDPResponse().mapToList(data);

    await this.redis.set(
      `${RedisKeys.ippIndusProductionIndex}:${industryFilter}`,
      mappedData,
      {
        ttl: TimeToLive.OneWeek,
      },
    );

    return mappedData;
  }

  async ippMostIndusProduction(industry: string): Promise<GDPResponse[]> {
    const industryFilter = IPPMostIndustryProductionMapping[industry] || '';

    const redisData = await this.redis.get<GDPResponse[]>(
      `${RedisKeys.ippMostIndusProduction}:${industryFilter}`,
    );
    if (redisData) return redisData;

    const query: string = `
      SELECT 
          [chiTieu] as [name],
          [thoiDiem] AS [date],
          [giaTri] AS [value]
      FROM [macroEconomic].[dbo].[DuLieuViMo]
      WHERE phanBang = N'CHỈ SỐ CÔNG NGHIỆP'
          AND nhomDuLieu = N'Sản lượng công nghiệp một số sản phẩm'
          AND thoiDiem >= '2009-01-01'
          AND [chiTieu] = ${industryFilter}
      ORDER BY [chiTieu] DESC, [thoiDiem];
    `;

    const data = await this.mssqlService.query<IIndustryGDPValue[]>(query);

    const mappedData = new GDPResponse().mapToList(data);

    await this.redis.set(
      `${RedisKeys.ippMostIndusProduction}:${industryFilter}`,
      mappedData,
      {
        ttl: TimeToLive.OneWeek,
      },
    );

    return mappedData;
  }

  async laborForce(){
    const redisData = await this.redis.get(RedisKeys.laborForce)
    if(redisData) return redisData
    const query = `
        SELECT
          chiTieu AS name,
          thoiDiem AS date,
          giaTri AS value
        FROM macroEconomic.dbo.DuLieuViMo
        WHERE chiTieu IN (N'Lao động có việc ( triệu người)', N'Lực lượng lao động ( triệu người)')
        AND phanBang = N'LAO ĐỘNG'
        AND nhomDulieu = N'Chỉ tiêu lao động'
        ORDER BY date ASC
    `
    const data = await this.mssqlService.query<LaborForceResponse[]>(query)
    const dataMapped = LaborForceResponse.mapToList(data)
    await this.redis.set(RedisKeys.laborForce, dataMapped, {ttl: TimeToLive.OneWeek})
    return dataMapped
  }

  async unemployedRate(){
    const redisData = await this.redis.get(RedisKeys.unemployedRate)
    if(redisData) return redisData
    const query = `
      SELECT
        chiTieu AS name,
        thoiDiem AS date,
        giaTri AS value
      FROM macroEconomic.dbo.DuLieuViMo
      WHERE chiTieu IN (N'Tỷ lệ chung', N'Thanh niên', N'Thanh niên thành thị')
        AND phanBang = N'LAO ĐỘNG'
        AND nhomDulieu = N'Chỉ tiêu lao động'
      ORDER BY date ASC
    `
    const data = await this.mssqlService.query<LaborForceResponse[]>(query)
    const dataMapped = LaborForceResponse.mapToList(data)
    await this.redis.set(RedisKeys.unemployedRate, dataMapped, {ttl: TimeToLive.OneWeek})
    return dataMapped
  }

  async laborRate(){
    const redisData = await this.redis.get(RedisKeys.laborRate)
    if(redisData) return redisData
    const query = `
        SELECT TOP 3
          chiTieu AS name,
          thoiDiem AS date,
          giaTri AS value
        FROM macroEconomic.dbo.DuLieuViMo
        WHERE chiTieu IN (N'Công nghiệp- Xây dựng', N'Dịch vụ', N'Nông lâm ngư nghiệp')
          AND phanBang = N'LAO ĐỘNG'
          AND nhomDulieu = N'Chỉ tiêu lao động'
        ORDER BY date desc
    `
    const data = await this.mssqlService.query<LaborForceResponse[]>(query)
    const dataMapped = LaborForceResponse.mapToList(data)
    await this.redis.set(RedisKeys.laborRate, dataMapped, {ttl: TimeToLive.OneWeek})
    return dataMapped
  }

  async informalLaborRate(){
    const redisData = await this.redis.get(RedisKeys.informalLaborRate)
    if(redisData) return redisData
    const query = `
        SELECT top 1
          chiTieu AS name,
          thoiDiem AS date,
          giaTri AS value
        FROM macroEconomic.dbo.DuLieuViMo
        WHERE chiTieu IN (N'Tỉ lệ lao động phi chính thức (%)')
          AND phanBang = N'LAO ĐỘNG'
          AND nhomDulieu = N'Chỉ tiêu lao động'
        ORDER BY date desc
    `
    const data = await this.mssqlService.query<LaborForceResponse[]>(query)
    const dataMapped = LaborForceResponse.mapToList(data)
    await this.redis.set(RedisKeys.informalLaborRate, dataMapped, {ttl: TimeToLive.OneWeek})
    return dataMapped
  }

  async averageSalary(){
    const redisData = await this.redis.get(RedisKeys.averageSalary)
    if(redisData) return redisData
    const query = `
      SELECT
        chiTieu AS name,
        thoiDiem AS date,
        giaTri AS value
      FROM macroEconomic.dbo.DuLieuViMo
      WHERE chiTieu IN (N'Mức chung', N'Nam giới', N'Nữ giới')
        AND phanBang = N'LAO ĐỘNG'
        AND nhomDulieu = N'Chỉ tiêu lao động'
      ORDER BY date ASC
    `
    const data = await this.mssqlService.query<LaborForceResponse[]>(query)
    const dataMapped = LaborForceResponse.mapToList(data)
    await this.redis.set(RedisKeys.averageSalary, dataMapped, {ttl: TimeToLive.OneWeek})
    return dataMapped
  }

  async employmentFluctuations(){
    const redisData = await this.redis.get(RedisKeys.employmentFluctuations)
    if(redisData) return redisData
    const query = `
      SELECT top 10
        chiTieu AS name,
        thoiDiem AS date,
        giaTri AS value
      FROM macroEconomic.dbo.DuLieuViMo
      WHERE chiTieu IN (
            N'Bán buôn/Bán lẻ', 
            N'Chế biến/Chế tạo', N'Dịch vụ', N'F&B', N'Giáo dục', N'Khai khoáng', N'Khối Nhà nước', N'Xây dựng', N'Sản xuất, phân phối nước', N'Nghệ thuật')
        AND phanBang = N'LAO ĐỘNG'
        AND nhomDulieu = N'Chỉ tiêu lao động'
      ORDER BY date desc
    `
    const data = await this.mssqlService.query<LaborForceResponse[]>(query)
    const dataMapped = LaborForceResponse.mapToList(data)
    await this.redis.set(RedisKeys.employmentFluctuations, dataMapped, {ttl: TimeToLive.OneWeek})
    return dataMapped
  }

  async totalPayment(){
    const redisData = await this.redis.get(RedisKeys.totalPayment)
    if(redisData) return redisData
    const query = `
      SELECT
        chiTieu AS name,
        giaTri AS value,
        thoiDiem AS date
      FROM macroEconomic.dbo.DuLieuViMo
      WHERE chiTieu IN (
        N'Cung tiền M2 (Tỷ đồng)',
        N'Tiền gửi của các TCKT (Tỷ đồng)',
        N'Tiền gửi của dân cư (Tỷ đồng)'
        )
      AND phanBang = N'TÍN DỤNG'
      AND nhomDulieu = N'Chỉ số tín dụng'
    `

    const data = await this.mssqlService.query<LaborForceResponse[]>(query)
    const dataMapped = LaborForceResponse.mapToList(data)
    await this.redis.set(RedisKeys.totalPayment, dataMapped, {ttl: TimeToLive.OneWeek})
    return dataMapped
  }

  async totalPaymentPercent(){
    const redisData = await this.redis.get(RedisKeys.totalPaymentPercent)
    if(redisData) return redisData
    const query = `
      WITH tindung
      AS (SELECT
          'Tin dung (Ty dong)' AS name,
          SUM(giaTri) AS value,
          thoiDiem AS date
        FROM macroEconomic.dbo.DuLieuViMo
        WHERE chiTieu IN (
          N'Tiền gửi của các TCKT (Tỷ đồng)',
          N'Tiền gửi của dân cư (Tỷ đồng)'
      )
      AND phanBang = N'TÍN DỤNG'
      AND nhomDulieu = N'Chỉ số tín dụng'
      GROUP BY thoiDiem)
      SELECT
        chiTieu AS name,
        giaTri AS value,
        thoiDiem AS date
      FROM macroEconomic.dbo.DuLieuViMo
      WHERE chiTieu IN (
      N'Cung tiền M2 (Tỷ đồng)',
      N'Cung tiền M2 (%)'
      )
      AND phanBang = N'TÍN DỤNG'
      AND nhomDulieu = N'Chỉ số tín dụng'
      UNION ALL
      SELECT
        name,
        value,
        date
      FROM tindung
      UNION ALL
      SELECT
        'Tin dung (%)' AS name,
        ((value - LEAD(value) OVER (ORDER BY date DESC)) / LEAD(value) OVER (ORDER BY date DESC)) * 100 AS value,
        date
      FROM tindung
      ORDER BY date ASC
    `

    const data = await this.mssqlService.query<LaborForceResponse[]>(query)
    const dataMapped = LaborForceResponse.mapToList(data)
    await this.redis.set(RedisKeys.totalPaymentPercent, dataMapped, {ttl: TimeToLive.OneWeek})
    return dataMapped
  }

  async balancePaymentInternational(){
    const redisData = await this.redis.get(RedisKeys.balancePaymentInternational)
    if(redisData) return redisData
    const query = `
    SELECT
      chiTieu AS name,
      thoiDiem AS date,
      giaTri AS value
    FROM macroEconomic.dbo.DuLieuViMo
    WHERE phanBang = N'TÍN DỤNG'
      AND nhomDulieu = N'Chỉ số tín dụng'
      AND chiTieu IN (
      N'Cán cân vãng lai (Triệu USD)',
      N'Cán cân tài chính (Triệu USD)',
      N'Cán cân tổng thể (Triệu USD)',
      N'Dự trữ (Triệu USD)'
    )
    ORDER BY thoiDiem ASC
    `
    const data = await this.mssqlService.query<LaborForceResponse[]>(query)
    const dataMapped = LaborForceResponse.mapToList(data)
    await this.redis.set(RedisKeys.balancePaymentInternational, dataMapped, {ttl: TimeToLive.OneWeek})
    return dataMapped
  }

  async creditDebt(){
    const redisData = await this.redis.get(RedisKeys.creditDebt)
    if(redisData) return redisData
    const query = `
    SELECT
      chiTieu AS name,
      thoiDiem AS date,
      giaTri AS value
    FROM macroEconomic.dbo.DuLieuViMo
    WHERE phanBang = N'TÍN DỤNG'
      AND nhomDulieu = N'Chỉ số tín dụng'
      AND chiTieu IN (
      N'Công nghiệp (Tỷ đồng)',
      N'Xây dựng (Tỷ đồng)',
      N'Vận tải và Viễn thông (Tỷ đồng)',
      N'Nông nghiệp, lâm nghiệp và thuỷ sản (Tỷ đồng)',
      N'Các hoạt động dịch vụ khác (Tỷ đồng)'
      )
    ORDER BY thoiDiem ASC
    `
    const data = await this.mssqlService.query<LaborForceResponse[]>(query)
    const dataMapped = LaborForceResponse.mapToList(data)
    await this.redis.set(RedisKeys.creditDebt, dataMapped, {ttl: TimeToLive.OneWeek})
    return dataMapped
  }

  async creditDebtPercent(){
    const redisData = await this.redis.get(RedisKeys.creditDebtPercent)
    if(redisData) return redisData
    const query = `
    SELECT
      chiTieu AS name,
      thoiDiem AS date,
      giaTri AS value
    FROM macroEconomic.dbo.DuLieuViMo
    WHERE phanBang = N'TÍN DỤNG'
      AND nhomDulieu = N'Chỉ số tín dụng'
      AND chiTieu IN (
      N'Công nghiệp (%)',
      N'Xây dựng (%)',
      N'Vận tải và Viễn thông (%)',
      N'Nông nghiệp, lâm nghiệp và thuỷ sản (%)',
      N'Các hoạt động dịch vụ khác (%)'
      )
    ORDER BY thoiDiem ASC
    `
    const data = await this.mssqlService.query<LaborForceResponse[]>(query)
    const dataMapped = LaborForceResponse.mapToList(data)
    await this.redis.set(RedisKeys.creditDebtPercent, dataMapped, {ttl: TimeToLive.OneWeek})
    return dataMapped
  }

  async creditInstitution(){
    const redisData = await this.redis.get(RedisKeys.creditInstitution)
    if(redisData) return redisData
    const query = `
    SELECT
      chiTieu AS name,
      thoiDiem AS date,
      giaTri AS value
    FROM macroEconomic.dbo.DuLieuViMo
    WHERE phanBang = N'TÍN DỤNG'
      AND nhomDulieu = N'Chỉ số tín dụng'
      AND chiTieu IN (
      N'NHTM Nhà nước (%)',
      N'NHTM Cổ phần (%)',
      N'NH Liên doanh, nước ngoài (%)'
      )
    ORDER BY thoiDiem ASC
    `
    const data = await this.mssqlService.query<LaborForceResponse[]>(query)
    const dataMapped = LaborForceResponse.mapToList(data)
    await this.redis.set(RedisKeys.creditInstitution, dataMapped, {ttl: TimeToLive.OneWeek})
    return dataMapped
  }

  async totalInvestmentProjects(order: number){
    const redisData = await this.redis.get(`${RedisKeys.totalInvestmentProjects}:${order}`)
    if(redisData) return redisData
    let date = ''
    let group = ''
    switch (order) {
      case TimeTypeEnum.Month:
        date = `thoiDiem as date,`
        group = `group by thoiDiem, RIGHT(chiTieu, 4)`
        break
      case TimeTypeEnum.Quarter:
        date = `case datepart(qq, thoiDiem)
        when 1 then cast(datepart(year, thoiDiem) as varchar) + '/03/31'
        when 2 then cast(datepart(year, thoiDiem) as varchar) + '/06/30'
        when 3 then cast(datepart(year, thoiDiem) as varchar) + '/09/30'
        when 4 then cast(datepart(year, thoiDiem) as varchar) + '/12/31'
        end as date,`
        group = `group by datepart(qq, thoiDiem), datepart(year, thoiDiem), RIGHT(chiTieu, 4)`
        break 
        default:
    }
    const query = `
    SELECT
      ${date}
      SUM(giaTri) AS value,
      CASE
        WHEN RIGHT(chiTieu, 4) = '(CM)' THEN 'CM'
        WHEN RIGHT(chiTieu, 4) = '(TV)' THEN 'TV'
        WHEN RIGHT(chiTieu, 4) = '(GV)' THEN 'GV'
      END AS name

    FROM macroEconomic.dbo.DuLieuViMo
    WHERE phanBang = 'FDI'
      AND chiTieu LIKE '%(CM)'
      or chiTieu LIKE '%(TV)'
      or chiTieu LIKE '%(GV)'
      AND nhomDulieu = N'Chỉ số FDI'
    ${group}
    ORDER BY date ASC
    `
    
    const data = await this.mssqlService.query<TotalInvestmentProjectsResponse[]>(query)
    const dataMapped = TotalInvestmentProjectsResponse.mapToList(data)
    await this.redis.set(`${RedisKeys.totalInvestmentProjects}:${order}`, dataMapped, {ttl: TimeToLive.OneWeek})
    return dataMapped
  }

  async foreignInvestmentIndex(q: ForeignInvestmentIndexDto){
    const redisData = await this.redis.get(`${RedisKeys.foreignInvestmentIndex}:${q.type}:${q.order}`)
    if(redisData) return redisData

    const type = q.type == 1 ? 'Chỉ số' : 'Đối tác'
    const lastDate = await this.mssqlService.query(`select top 2 thoiDiem as date from macroEconomic.dbo.DuLieuViMo WHERE phanBang = 'FDI'
    AND nhomDulieu = N'${type} FDI'  
    and chiTieu like N'%(CM%'
    group by thoiDiem
    order by thoiDiem desc `
    )
    
    const quarter = UtilCommonTemplate.getLastTwoQuarters(lastDate[0].date)
    
    const select = +q.order == TimeTypeEnum.Month ? `giaTri AS value,
    thoiDiem AS date,` : `sum(giaTri) AS value, cast(datepart(year, thoiDiem) as varchar) + cast(datepart(qq, thoiDiem) as varchar) AS date,`
    const group = +q.order == TimeTypeEnum.Quarter ? `group by datepart(year, thoiDiem), datepart(qq, thoiDiem), LEFT(chiTieu, CHARINDEX('(', chiTieu) - 2), RIGHT(chiTieu, 14), RIGHT(chiTieu, 4)` : ``
    const date = +q.order == TimeTypeEnum.Month ? `AND thoiDiem IN ('${UtilCommonTemplate.toDate(lastDate[0].date)}', '${UtilCommonTemplate.toDate(lastDate[1].date)}')` : `AND thoiDiem between '${quarter.months[0]}' and '${quarter.months[5]}'`
    
    const query = `
    WITH temp
    AS (SELECT
      LEFT(chiTieu, CHARINDEX('(', chiTieu) - 2) AS name,
      ${select}
      CASE
        WHEN RIGHT(chiTieu, 14) = N'(CM triệu USD)' THEN 1
        WHEN RIGHT(chiTieu, 4) = '(CM)' THEN 2
      END AS type
    FROM macroEconomic.dbo.DuLieuViMo
    WHERE phanBang = 'FDI'
    AND nhomDulieu = N'${type} FDI'
    AND chiTieu LIKE N'%(CM%'
    ${date}
    ${group}
    UNION ALL
    SELECT
      LEFT(chiTieu, CHARINDEX('(', chiTieu) - 2) AS name,
      ${select}
      CASE
        WHEN RIGHT(chiTieu, 14) = N'(TV triệu USD)' THEN 3
        WHEN RIGHT(chiTieu, 4) = '(TV)' THEN 4
      END AS type
    FROM macroEconomic.dbo.DuLieuViMo
    WHERE phanBang = 'FDI'
    AND nhomDulieu = N'${type} FDI'
    AND chiTieu LIKE N'%(TV%'
    ${date}
    ${group}
    UNION ALL
    SELECT
      LEFT(chiTieu, CHARINDEX('(', chiTieu) - 2) AS name,
      ${select}
      CASE
        WHEN RIGHT(chiTieu, 14) = N'(GV triệu USD)' THEN 5
        WHEN RIGHT(chiTieu, 4) = '(GV)' THEN 6
      END AS type
    FROM macroEconomic.dbo.DuLieuViMo
    WHERE phanBang = 'FDI'
    AND nhomDulieu = N'${type} FDI'
    AND chiTieu LIKE N'%(GV%'
    ${date}
    ${group}),
    pivoted
    AS (SELECT
      name,
      type,
      [${+q.order == TimeTypeEnum.Month ? UtilCommonTemplate.toDate(lastDate[1].date) : quarter.quarters[1]}] AS now,
      [${+q.order == TimeTypeEnum.Month ? UtilCommonTemplate.toDate(lastDate[0].date) : quarter.quarters[0]}] AS pre
    FROM temp AS source PIVOT (SUM(value) FOR date IN ([${+q.order == TimeTypeEnum.Month ? UtilCommonTemplate.toDate(lastDate[1].date) : quarter.quarters[1]}], [${+q.order == TimeTypeEnum.Month ? UtilCommonTemplate.toDate(lastDate[0].date) : quarter.quarters[0]}])) AS bang_chuyen)
    SELECT
      *
    FROM pivoted
    where name != ''
    `
    const data = await this.mssqlService.query<any[]>(query)

    const now = {
      1: 'cm_usd',
      2: 'cm',
      3: 'tv_usd',
      4: 'tv',
      5: 'gv_usd',
      6: 'gv',
    }

    const pre = {
      1: 'cm_usd_pre',
      2: 'cm_pre',
      3: 'tv_usd_pre',
      4: 'tv_pre',
      5: 'gv_usd_pre',
      6: 'gv_pre',
    }
    
    const data_reduce = data.reduce((acc, item) => {
      const index = acc.findIndex(child => child.name == item.name)
      
      if(index != -1){
        acc[index][now[item.type]] = item.now
        acc[index][pre[item.type]] = item.pre
        acc[index]['total'] = (acc[index]['cm_usd'] || 0) + (acc[index]['tv_usd'] || 0) + (acc[index]['gv_usd'] || 0)
        acc[index]['total_pre'] = (acc[index]['cm_usd_pre'] || 0) + (acc[index]['tv_usd_pre'] || 0) + (acc[index]['gv_usd_pre'] || 0)
        return acc
      }
      acc.push({
        name: item.name, 
        [now[item.type]]: item.now, 
        [pre[item.type]]: item.pre, 
      })
      return acc
    }, [])

    const dataMapped = ForeignInvestmentIndexResponse.mapToList(data_reduce)
    await this.redis.set(`${RedisKeys.foreignInvestmentIndex}:${q.type}:${q.order}`, dataMapped, {ttl: TimeToLive.OneWeek})
    return dataMapped
  }

  async accumulated(q: FDIOrderDto){
    const redisData = await this.redis.get(`${RedisKeys.accumulated}:${q.order}`)
    if(redisData) return redisData

    let date: string = ''
    let group: string = ''
    switch (+q.order) {
      case TimeTypeEnum.Month:
        date = `giaTri as value, thoiDiem as date,`
        break
      case TimeTypeEnum.Quarter:
        date = `
        sum(giaTri) as value,
        case datepart(qq, thoiDiem)
        when 1 then cast(datepart(year, thoiDiem) as varchar) + '/03/31'
        when 2 then cast(datepart(year, thoiDiem) as varchar) + '/06/30'
        when 3 then cast(datepart(year, thoiDiem) as varchar) + '/09/30'
        when 4 then cast(datepart(year, thoiDiem) as varchar) + '/12/31'
        end as date, `
        group = `group by datepart(qq, thoiDiem), datepart(year, thoiDiem), LEFT(chiTieu, CHARINDEX('(', chiTieu) - 2)`
        break
      default:
        date = `thoiDiem as date,`
    } 
    const query = `
    WITH temp
    AS (SELECT
      LEFT(chiTieu, CHARINDEX('(', chiTieu) - 2) AS name,
      ${date}
      1 AS type
    FROM macroEconomic.dbo.DuLieuViMo
    WHERE phanBang = 'FDI'
    AND nhomDulieu = N'Chỉ số FDI'
    AND chiTieu LIKE N'%(Lũy kế 1988)%'

    AND thoiDiem > '2020-01-01'
    ${group}
    UNION ALL
    SELECT
      LEFT(chiTieu, CHARINDEX('(', chiTieu) - 2) AS name,
      ${date}
      2 AS type
    FROM macroEconomic.dbo.DuLieuViMo
    WHERE phanBang = 'FDI'
    AND nhomDulieu = N'Chỉ số FDI'
    AND chiTieu LIKE N'%(Lũy kế vốn 1988 triệu USD)%'
    AND thoiDiem > '2020-01-01'
    ${group}
    )
    SELECT
      name,
      date,
      [1] AS luy_ke,
      [2] AS luy_ke_von
    FROM (SELECT
      *
    FROM temp) AS source PIVOT (SUM(value) FOR type IN ([1], [2])) AS chuyen
    where name != ''
`
    const data = await this.mssqlService.query<AccumulatedResponse[]>(query)
    const dataMapped = AccumulatedResponse.mapToList(data)
    await this.redis.set(`${RedisKeys.accumulated}:${q.order}`, dataMapped, {ttl: TimeToLive.OneWeek})
    return dataMapped
  }

  async totalRegisteredAndDisbursed(q: FDIOrderDto){
    const redisData = await this.redis.get(`${RedisKeys.totalRegisteredAndDisbursed}:${+q.order}`)
    if(redisData) return redisData

    let date: string = ''
    let group: string = ''
    switch (+q.order) {
      case TimeTypeEnum.Month:
        date = `giaTri as value, thoiDiem as date`
        break
      case TimeTypeEnum.Quarter:
        date = `
        sum(giaTri) as value,
        case datepart(qq, thoiDiem)
        when 1 then cast(datepart(year, thoiDiem) as varchar) + '/03/31'
        when 2 then cast(datepart(year, thoiDiem) as varchar) + '/06/30'
        when 3 then cast(datepart(year, thoiDiem) as varchar) + '/09/30'
        when 4 then cast(datepart(year, thoiDiem) as varchar) + '/12/31'
        end as date`
        group = `group by datepart(qq, thoiDiem), datepart(year, thoiDiem), chiTieu`
        break
      default:
        date = `thoiDiem as date,`
    } 
    const query = 
    `
    SELECT
      chiTieu AS name,
      ${date}
    FROM macroEconomic.dbo.DuLieuViMo
    WHERE phanBang = 'FDI'
    AND nhomDulieu = N'Chỉ số FDI'
    AND chiTieu IN (N'Tổng vốn đăng ký (triệu USD)', N'Tổng vốn giải ngân (triệu USD)')
    AND thoiDiem >= '2018-01-01'
    ${group}
    ORDER BY date asc
    `
    const data = await this.mssqlService.query<LaborForceResponse[]>(query)
    const dataMapped = LaborForceResponse.mapToList(data)
    await this.redis.set(`${RedisKeys.totalRegisteredAndDisbursed}:${+q.order}`, dataMapped, {ttl: TimeToLive.OneWeek})
    return dataMapped
  }

  async corporateBondsIssuedSuccessfully(){
    const redisData = await this.redis.get(`${RedisKeys.corporateBondsIssuedSuccessfully}`)
    // if(redisData) return redisData

    const query = `
    SELECT
      type as name,
      SUM(CAST(menhGia AS bigint) * CAST(kLPhatHanh AS bigint)) AS value,
      DATEPART(MONTH, ngayPhatHanh) AS month,
      DATEPART(YEAR, ngayPhatHanh) AS year
    FROM marketBonds.dbo.BondsInfor
    WHERE ngayPhatHanh >= '01-01-2018'
    GROUP BY DATEPART(MONTH, ngayPhatHanh),
            DATEPART(YEAR, ngayPhatHanh),
            type
    `
    console.log(query);
    
    const data = await this.mssqlService.query<CorporateBondsIssuedSuccessfullyResponse[]>(query)
    const dataMapped = CorporateBondsIssuedSuccessfullyResponse.mapToList(data)
    await this.redis.set(`${RedisKeys.corporateBondsIssuedSuccessfully}`, dataMapped, {ttl: TimeToLive.OneDay})
    return dataMapped
  }

  async averageDepositInterestRate(){
    const redisData = await this.redis.get(`${RedisKeys.averageDepositInterestRate}`)
    if(redisData) return redisData
    
    const date = UtilCommonTemplate.getPreviousMonth(new Date(), 20, 1)
    
    const query_map = date.map(item => `
    SELECT
      type as name,
      SUM(CAST(menhGia AS bigint) * CAST(kLPhatHanh AS int)) AS tt,
      SUM(CAST(menhGia AS bigint) * CAST(kLPhatHanh AS int) * CAST(laiSuatPhatHanh AS float)) AS lainam,
      SUM(CAST(menhGia AS bigint) * CAST(kLPhatHanh AS int) * CAST(laiSuatPhatHanh AS float)) / SUM(CAST(menhGia AS bigint) * CAST(kLPhatHanh AS int)) AS value,
      '${moment(item, 'YYYY-MM-DD').format('YYYY/MM/DD')}' AS date
    FROM marketBonds.dbo.BondsInfor
    WHERE '${item}' BETWEEN ngayPhatHanh AND ngayDaoHan
    GROUP BY type
    `)
    
    const data = await this.mssqlService.query<CorporateBondsIssuedSuccessfullyResponse[]>(query_map.join('UNION ALL'))
    const dataMapped = CorporateBondsIssuedSuccessfullyResponse.mapToList(data)

    await this.redis.set(`${RedisKeys.averageDepositInterestRate}`, dataMapped, { ttl: TimeToLive.OneWeek })
    return dataMapped
  }

  async totalOutstandingBalance(){
    const redisData = await this.redis.get(`${RedisKeys.totalOutstandingBalance}`)
    if(redisData) return redisData

    const date = UtilCommonTemplate.getPreviousMonth(new Date(), 1, 1)
    const query = `
    SELECT TOP 50
      doanhNghiep as name,
      SUM(CAST(menhGia AS bigint) * CAST(kLPhatHanh AS int)) AS total,
      SUM(CAST(menhGia AS bigint) * CAST(kLPhatHanh AS int) * CAST(laiSuatPhatHanh AS float)) AS lainam,
      SUM(CAST(menhGia AS bigint) * CAST(kLPhatHanh AS int) * CAST(laiSuatPhatHanh AS float)) / SUM(CAST(menhGia AS bigint) * CAST(kLPhatHanh AS int)) AS interest_rate,
      '${date}' AS date
    FROM marketBonds.dbo.BondsInfor
    WHERE '${date}' BETWEEN ngayPhatHanh AND ngayDaoHan
    GROUP BY doanhNghiep
    ORDER BY interest_rate DESC
    `
    const data = await this.mssqlService.query<TotalOutstandingBalanceResponse[]>(query)
    const dataMapped = TotalOutstandingBalanceResponse.mapToList(data)
    await this.redis.set(`${RedisKeys.totalOutstandingBalance}`, dataMapped, { ttl: TimeToLive.OneWeek })
    return dataMapped
  }

  async estimatedValueOfCorporateBonds(){
    const redisData = await this.redis.get(`${RedisKeys.estimatedValueOfCorporateBonds}`)
    if(redisData) return redisData

    const date = UtilCommonTemplate.getPreviousMonth(new Date(), 1, 1)
    
    const query = `
    SELECT
      type as name,
      SUM((CAST(menhGia AS bigint) * CAST(kLPhatHanh AS bigint)) * (1 + laiSuatPhatHanh)) AS value,
      DATEPART(MONTH, ngayDaoHan) AS month,
      DATEPART(YEAR, ngayDaoHan) AS year
    FROM marketBonds.dbo.BondsInfor
    WHERE ngayDaoHan > '${date[0]}'
    GROUP BY DATEPART(MONTH, ngayDaoHan),
            DATEPART(YEAR, ngayDaoHan),
            type
    `
    const data = await this.mssqlService.query<CorporateBondsIssuedSuccessfullyResponse[]>(query)
    const dataMapped = CorporateBondsIssuedSuccessfullyResponse.mapToList(data)
    await this.redis.set(`${RedisKeys.estimatedValueOfCorporateBonds}`, dataMapped, { ttl: TimeToLive.OneWeek })
    return dataMapped
  }
}

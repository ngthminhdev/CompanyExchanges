import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { DataSource } from 'typeorm';
import { DB_SERVER } from '../constants';
import { RedisKeys } from '../enums/redis-keys.enum';
import { MssqlService } from '../mssql/mssql.service';
import { UtilCommonTemplate } from '../utils/utils.common';
import { IPayoutRatio } from './interfaces/payout-ratio.interface';
import { IPEIndustry, ISPEPBIndustry } from './interfaces/pe-pb-industry-interface';
import { MarketService } from './market.service';
import { PayoutRatioResponse } from './responses/payout-ratio.response';
import { PEBResponse } from './responses/peb-ticker.response';
import { PEPBIndustryResponse } from './responses/pepb-industry.response';
import { CashRatioResponse } from './responses/cash-ratio.response';
import { ISRotationRatio } from './interfaces/rotation-ratio.interface';
import { RotationRatioResponse } from './responses/rotation.response';
import { ISIndsDebtSolvency } from './interfaces/Inds-debt-solvency.interface';
import { DebtSolvencyResponse } from './responses/debt-solvency.response';
import { ISIndsProfitMargins } from './interfaces/inds-profit-margin.interface';
import { ProfitMarginResponse } from './responses/profit-margin.response';
import { TimeToLive } from '../enums/common.enum';
import { PEIndustryResponse } from './responses/pe-industry.response';

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

    const date = UtilCommonTemplate.getYearQuarters(type, order);

    const { dateFilter } = UtilCommonTemplate.getDateFilter(date);

    // const query = `
    //   with valueData as (
    //       select
    //           [code], 
    //           [date],
    //           [ratioCode],
    //           [value]
    //       from RATIO.dbo.ratio
    //       where
    //       ratioCode in ('PRICE_TO_BOOK', 'PRICE_TO_EARNINGS')
    //       and date in ${dateFilter}
    //   )
    //   select [LV2] industry, [date], [PRICE_TO_BOOK] PB, [PRICE_TO_EARNINGS] PE
    //   from (
    //       select [LV2], [date], [ratioCode], value
    //       from valueData v
    //       inner join marketInfor.dbo.info i
    //               on i.code = v.code
    //           where i.LV2 != ''
    //               and i.floor in ${floor}
    //               and i.type in ('STOCK', 'ETF')
    //               and i.status = 'listed'
    //   --     group by LV2, ratioCode, [date]
    //   ) as srouces
    //   pivot (
    //       avg(value)
    //       for ratioCode in ([PRICE_TO_BOOK], [PRICE_TO_EARNINGS])
    //   ) as pvTable
    // `;

    const query =  `
        select industry, date, sum(PB) as PB from VISUALIZED_DATA.dbo.PB
        where date IN ${dateFilter}
        and floor IN ${floor}
        group by industry, date
    `
    const data = await this.mssqlService.query<ISPEPBIndustry[]>(query);

    const mappedData = new PEPBIndustryResponse().mapToList(data);

    await this.redis.set(
      `${RedisKeys.PEPBIndustry}:${floor}:${order}:${type}`,
      mappedData,
      { ttl: TimeToLive.OneWeek },
    );

    return mappedData;
  }

  async PEIndustry(ex: string, type: number, order: number) {
    const floor = ex == 'ALL' ? ` ('HOSE', 'HNX', 'UPCOM') ` : ` ('${ex}') `;
    const redisData = await this.redis.get(
      `${RedisKeys.PEIndustry}:${floor}:${order}:${type}`,
    );
    if (redisData) return redisData;

    const date = UtilCommonTemplate.getYearQuarters(type, order);

    const { dateFilter } = UtilCommonTemplate.getDateFilter(date);

    const query = `
      WITH epsData AS
      (
        SELECT  [industry]
              ,[date]
              ,[floor]
              ,SUM([thuNhapRong4Quy]) / SUM(shareOut) AS EPS
        FROM [VISUALIZED_DATA].[dbo].[EPS_code]
        WHERE floor in ${floor}
        AND [date] IN ${dateFilter}
        GROUP BY  [industry]
                ,[date]
                ,[floor]
      ), bqgqData AS
      (
        SELECT  b.[industry]
              ,b.[date]
              ,b.[floor]
              ,SUM([marketCap]) / sum([shareOut]) AS [giaBQGQ]
        FROM VISUALIZED_DATA.dbo.BQGQ b
        WHERE floor in ${floor}
        AND [date] IN ${dateFilter}
        GROUP BY  [industry]
                ,[date]
                ,[floor]
      )
      SELECT  b.[industry]
            ,b.[date]
            ,SUM([giaBQGQ]) / SUM(NULLIF([EPS],0)) AS PE
      FROM bqgqData b
      INNER JOIN epsData e
      ON b.[industry] = e.[industry] AND b.[date] = e.[date] AND b.[floor] = e.[floor]
      GROUP BY  b.[industry]
              ,b.[date]
    `;

    const data = await this.mssqlService.query<IPEIndustry[]>(query);

    const mappedData = new PEIndustryResponse().mapToList(data);

    await this.redis.set(
      `${RedisKeys.PEIndustry}:${floor}:${order}:${type}`,
      mappedData,
      { ttl: TimeToLive.OneWeek },
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

    const { latestDate } = await this.marketService.getSessionDate(
      'marketTrade.dbo.proprietary',
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
          PData as (select c.date, c.code, r.value as pData
                    from codeData c
                             inner join RATIO.dbo.ratio r
                                        on c.code = r.code
                    where r.ratioCode = 'PRICE_TO_EARNINGS'
                      and r.date = '${latestDate}')
      select top 50 c.code,
            c.date,
            e.epsVND as VND,
            (c.closePrice - c.prevClosePrice) / c.prevClosePrice * 100 as pricePerChange,
            p.pData
      from codeData c
              inner join epsVNDData e
                          on c.code = e.code and c.date = e.date
              inner join PData p 
                          on c.code = p.code and c.date = p.date
      order by 2 desc, 3 desc
    `;

    const data = await this.mssqlService.query<any[]>(query);

    const mappedData = new PEBResponse().mapToList(data);

    await this.redis.set(`${RedisKeys.PETicker}:${floor}:${inds}`, mappedData, {ttl: TimeToLive.OneWeek});

    return mappedData;
  }

  async PBTicker(ex: string, industries: string[]) {
    const floor = ex == 'ALL' ? ` ('HOSE', 'HNX', 'UPCOM') ` : ` ('${ex}') `;
    const inds: string = UtilCommonTemplate.getIndustryFilter(industries);

    const redisData = await this.redis.get(
      `${RedisKeys.PBTicker}:${floor}:${inds}`,
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

    const { latestDate } = await this.marketService.getSessionDate(
      'marketTrade.dbo.proprietary',
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
          gtssVNDData as (select c.date, c.code, r.value as gtssVND
                          from codeData c
                                  inner join RATIO.dbo.ratio r
                                              on c.code = r.code
                          where r.ratioCode = 'BVPS_CR'
                            and r.date = '${latestDate}'),
          PData as (select c.date, c.code, r.value as pData
                    from codeData c
                             inner join RATIO.dbo.ratio r
                                        on c.code = r.code
                    where r.ratioCode = 'PRICE_TO_BOOK'
                      and r.date = '${latestDate}')
      select top 50 c.code,
            c.date,
            e.gtssVND as VND,
            (c.closePrice - c.prevClosePrice) / c.prevClosePrice * 100 as pricePerChange,
            p.pData
      from codeData c
              inner join gtssVNDData e
                          on c.code = e.code and c.date = e.date
              inner join PData p 
                          on c.code = p.code and c.date = p.date
      order by 2 desc, 3 desc
    `;

    const data = await this.mssqlService.query<any[]>(query);

    const mappedData = new PEBResponse().mapToList(data);

    await this.redis.set(`${RedisKeys.PBTicker}:${floor}:${inds}`, mappedData, {
      ttl: TimeToLive.OneDay,
    });

    return mappedData;
  }

  async payoutRatio(ex: string, order: number) {
    const floor = ex == 'ALL' ? ` ('HOSE', 'HNX', 'UPCOM') ` : ` ('${ex}') `;
    const redisData = await this.redis.get(
      `${RedisKeys.PayoutRatio}:${ex}:${order}`,
    );
    if (redisData) return redisData;

    const date = UtilCommonTemplate.getPastDate(2, order);

    const { dateFilter } = UtilCommonTemplate.getDateFilter(date);

    const query: string = `
      with valueData as (
          select
              [code],
              [date],
              [ratioCode],
              [value]
          from RATIO.dbo.ratio
          where
          ratioCode in ('QUICK_RATIO_AQ', 'CURRENT_RATIO_AQ')
          and date in ${dateFilter}
      )
      select  [LV2] as industry, [date], 
              [QUICK_RATIO_AQ] as quickRatio, 
              [CURRENT_RATIO_AQ] as currentRatio
      from (
          select [LV2], [date], [ratioCode], value
          from valueData v
          inner join marketInfor.dbo.info i
                  on i.code = v.code
              where i.LV2 != ''
                  and i.floor in ${floor}
                  and i.type in ('STOCK', 'ETF')
                  and i.status = 'listed'
      ) as srouces
      pivot (
          avg(value)
          for ratioCode in ([QUICK_RATIO_AQ], [CURRENT_RATIO_AQ])
      ) as pvTable
        order by date
    `;

    const data = await this.mssqlService.query<IPayoutRatio[]>(query);

    const mappedData = new PayoutRatioResponse().mapTolist(data);

    await this.redis.set(
      `${RedisKeys.PayoutRatio}:${ex}:${order}`,
      mappedData,
      { ttl: TimeToLive.OneWeek },
    );

    return mappedData;
  }

  async cashRatio(ex: string, order: number) {
    const floor = ex == 'ALL' ? ` ('HOSE', 'HNX', 'UPCOM') ` : ` ('${ex}') `;
    const redisData = await this.redis.get(
      `${RedisKeys.CashRatio}:${ex}:${order}`,
    );
    if (redisData) return redisData;

    const date = UtilCommonTemplate.getYearQuarters(2, order);

    const { dateFilter } = UtilCommonTemplate.getDateFilter(date);

    const query: string = `
      with valueData as (select [code],
                                [year],
                                [reportName],
                                [value]
                        from financialReport.dbo.financialReport
                        where reportName in
                              (N'Tiền và tương đương tiền', N'Nợ ngắn hạn')
                          and year in ${dateFilter})
      select industry,
            year as date,
            sum([Tiền và tương đương tiền]) / sum([Nợ ngắn hạn]) as cashRatio
      from (select i.lv2 as industry,
                  reportName,
                  year,
                  value
            from marketInfor.dbo.info i
                    inner join valueData v on i.code = v.code
            where i.floor in ${floor}
              and i.type in ('STOCK', 'ETF')
              and i.status = 'listed') as sources
              pivot (
              sum(value)
              for reportName in ([Tiền và tương đương tiền]
              , [Nợ ngắn hạn])
              ) as pvtable
      group by industry, year
      order by year
    `;

    const data = await this.mssqlService.query<IPayoutRatio[]>(query);

    const mappedData = new CashRatioResponse().mapTolist(data);

    await this.redis.set(`${RedisKeys.CashRatio}:${ex}:${order}`, mappedData, {
      ttl: TimeToLive.OneWeek,
    });

    return mappedData;
  }

  async rotationRatio(ex: string, order: number) {
    const floor = ex == 'ALL' ? ` ('HOSE', 'HNX', 'UPCOM') ` : ` ('${ex}') `;
    const redisData = await this.redis.get(
      `${RedisKeys.RotaionRatio}:${ex}:${order}`,
    );
    if (redisData) return redisData;

    const date = UtilCommonTemplate.getYearQuarters(2, order);

    const { dateFilter } = UtilCommonTemplate.getDateFilter(date);

    const query: string = `
      with valueData as (select [code],
                                [year],
                                [reportName],
                                [value]
                        from financialReport.dbo.financialReport
                        where reportName in
                              (N'Doanh số thuần', N'Thu nhập lãi thuần',
                                N'Tài sản cố định', N'Tiền và tương đương tiền',
                                N'TỔNG TÀI SẢN', N'VỐN CHỦ SỞ HỮU')
                          and year in ${dateFilter}),
      finalData as (
          select industry,
            year date,
            case industry
                when N'Dịch vụ tài chính' then [Thu nhập lãi thuần]
                when N'Bảo hiểm' then [Thu nhập lãi thuần]
                when N'Ngân hàng' then [Thu nhập lãi thuần]
                else [Doanh số thuần]
                end                    doanhThu,
            [Tài sản cố định]          taiSanCoDinh,
            [Tiền và tương đương tiền] tienVaTuongDuong,
            [TỔNG TÀI SẢN]             tongTaiSan,
            [VỐN CHỦ SỞ HỮU]           vonChuSoHuu
      from (select i.lv2 as industry,
                  reportName,
                  year,
                  value
            from marketInfor.dbo.info i
                    inner join valueData v on i.code = v.code
            where i.floor in ${floor}
              and i.type in ('STOCK', 'ETF')
              and i.status = 'listed'
              and i.LV2 not in (N'Ngân Hàng', N'Bảo hiểm')
            ) as sources
              pivot (
              sum(value)
              for reportName in (
              [Doanh số thuần], [Thu nhập lãi thuần],
              [Tài sản cố định], [Tiền và tương đương tiền],
              [TỔNG TÀI SẢN], [VỐN CHỦ SỞ HỮU])
              ) as pvtable
      )
      select
          industry,
          date,
          sum(doanhThu) / sum(nullif(taiSanCoDinh, 0)) as FAT,
          sum(doanhThu) / sum(nullif(tienVaTuongDuong, 0)) as CTR,
          sum(doanhThu) / sum(nullif(tongTaiSan, 0)) as ATR,
          sum(doanhThu) / sum(nullif(vonChuSoHuu, 0)) as CT
      from finalData
      group by industry, date
      order by date
    `;

    const data = await this.mssqlService.query<ISRotationRatio[]>(query);

    const mappedData = new RotationRatioResponse().mapToList(data);

    await this.redis.set(
      `${RedisKeys.RotaionRatio}:${ex}:${order}`,
      mappedData,
      { ttl: TimeToLive.OneWeek },
    );

    return mappedData;
  }

  async indsDebtSolvency(ex: string, order: number) {
    const floor = ex == 'ALL' ? ` ('HOSE', 'HNX', 'UPCOM') ` : ` ('${ex}') `;
    const redisData = await this.redis.get(
      `${RedisKeys.IndsDebtSolvency}:${ex}:${order}`,
    );
    if (redisData) return redisData;

    const date = UtilCommonTemplate.getYearQuarters(1, order);

    const { dateFilter } = UtilCommonTemplate.getDateFilter(date);

    const query: string = `
      with valueData as (select [code],
                                [year],
                                [reportName],
                                [value]
                        from financialReport.dbo.financialReport
                        where reportName in
                              (N'Lãi trước thuế', N'Tổng lợi nhuận kế toán trước thuế',
                                N'Tổng lợi nhuận trước thuế', N'Chi phí lãi và các chi phí tương tự',
                                N'Chi phí lãi vay', N'Chi phí hoạt động',
                                N'Tổng nợ phải trả', N'Nợ phải trả',
                                N'TỔNG TÀI SẢN', N'TỔNG CỘNG TÀI SẢN',
                                N'VỐN CHỦ SỞ HỮU'
                                  )
                          and year in ${dateFilter}),
          canculatedData as (select industry,
                                    year,
                                    case industry
                                        when N'Bảo hiểm' then [Tổng lợi nhuận kế toán trước thuế]
                                        when N'Dịch vụ tài chính' then [Tổng lợi nhuận kế toán trước thuế]
                                        when N'Ngân hàng' then [Tổng lợi nhuận trước thuế]
                                        else [Lãi trước thuế]
                                        end             loiNhuan,
                                    case industry
                                        when N'Ngân hàng' then [Tổng nợ phải trả]
                                        else [Nợ phải trả]
                                        end             noPhaiTra,
                                    case industry
                                        when N'Bảo hiểm' then [TỔNG CỘNG TÀI SẢN]
                                        else [TỔNG TÀI SẢN]
                                        end             tongTaiSan,
                                    case industry
                                        when N'Ngân hàng' then [Chi phí lãi và các chi phí tương tự]
                                        else [Chi phí lãi vay]
                                        end             chiPhiLaiVay,
                                    [Chi phí hoạt động] chiPhiHoatDong,
                                    [VỐN CHỦ SỞ HỮU]    vonChuSoHuu
                              from (select i.lv2 as industry,
                                          reportName,
                                          year,
                                          value
                                    from marketInfor.dbo.info i
                                            inner join valueData v on i.code = v.code
                                    where i.floor in ${floor}
                                      and i.type in ('STOCK', 'ETF')
                                      and i.status = 'listed') as sources
                                      pivot (
                                      sum(value)
                                      for reportName in (
                                      [Tổng lợi nhuận kế toán trước thuế], [Tổng lợi nhuận trước thuế],
                                      [Chi phí hoạt động], [Lãi trước thuế],
                                      [Chi phí lãi vay], [Chi phí lãi và các chi phí tương tự],
                                      [Tổng nợ phải trả], [Nợ phải trả],
                                      [TỔNG CỘNG TÀI SẢN],
                                      [TỔNG TÀI SẢN],
                                      [VỐN CHỦ SỞ HỮU]
                                      )
                                      ) as pvtable)
      select [industry],
            [year] [date],
            (sum(loiNhuan) + sum(chiPhiLaiVay)) / sum(chiPhiLaiVay) ICR,
            sum(noPhaiTra) / sum(tongTaiSan)                        TDTA,
            sum(noPhaiTra) / sum(vonChuSoHuu)                       DE
      from canculatedData
      group by industry, year
      order by year, industry
    `;

    const data = await this.mssqlService.query<ISIndsDebtSolvency[]>(query);

    const mappedData = new DebtSolvencyResponse().mapToList(data);

    await this.redis.set(
      `${RedisKeys.IndsDebtSolvency}:${ex}:${order}`,
      mappedData,
      { ttl: TimeToLive.OneWeek },
    );

    return mappedData;
  }

  async indsProfitMargins(ex: string, type: number, order: number) {
    const floor = ex == 'ALL' ? ` ('HOSE', 'HNX', 'UPCOM') ` : ` ('${ex}') `;
    const redisData = await this.redis.get(
      `${RedisKeys.IndsProfitMargins}:${floor}:${order}:${type}`,
    );
    if (redisData) return redisData;

    const date = UtilCommonTemplate.getYearQuarters(type, order);

    const { dateFilter } = UtilCommonTemplate.getDateFilter(date);

    const query = `
      with valueData as (select [code],
                                [year],
                                [reportName],
                                [value]
                        from financialReport.dbo.financialReport
                        where reportName in
                              (
                                N'Lợi nhuận gộp',
                                N'Doanh số thuần', N'Thu nhập lãi thuần',
                                N'Lãi trước thuế', N'Tổng lợi nhuận kế toán trước thuế',
                                N'Tổng lợi nhuận trước thuế',
                              N'Doanh thu thuần từ hoạt động kinh doanh bảo hiểm '
                                  )
                          and year in ${dateFilter}),
          canculatedData as (select industry,
                                    year,
                                    case industry
                                        when N'Dịch vụ tài chính' then [Thu nhập lãi thuần]
                                        when N'Bảo hiểm' then [Doanh thu thuần từ hoạt động kinh doanh bảo hiểm ]
                                        when N'Ngân hàng' then [Thu nhập lãi thuần]
                                        else [Doanh số thuần]
                                        end doanhThu,
                                    case industry
                                        when N'Bảo hiểm' then [Tổng lợi nhuận kế toán trước thuế]
                                        when N'Dịch vụ tài chính' then [Tổng lợi nhuận kế toán trước thuế]
                                        when N'Ngân hàng' then [Tổng lợi nhuận trước thuế]
                                        else [Lãi trước thuế]
                                        end loiNhuan
                              from (select i.lv2 as industry,
                                          reportName,
                                          year,
                                          value
                                    from marketInfor.dbo.info i
                                            inner join valueData v on i.code = v.code
                                    where i.floor in ${floor}
                                      and i.type in ('STOCK', 'ETF')
                                      and i.status = 'listed') as sources
                                      pivot (
                                      sum(value)
                                      for reportName in (
                                      [Lợi nhuận gộp],
                                      [Doanh số thuần],
                                      [Thu nhập lãi thuần],
                                      [Lãi trước thuế], [Tổng lợi nhuận kế toán trước thuế],
                                      [Tổng lợi nhuận trước thuế],
                                      [Doanh thu thuần từ hoạt động kinh doanh bảo hiểm ]
                                      )
                                      ) as pvtable)
      select [industry],
            [year] [date],
            sum(loiNhuan) / sum(doanhThu) as GPM
      from canculatedData
      group by industry, year;
    `;

    const data = await this.mssqlService.query<ISIndsProfitMargins[]>(query);

    const mappedData = new ProfitMarginResponse().mapToList(data);

    await this.redis.set(
      `${RedisKeys.IndsProfitMargins}:${floor}:${order}:${type}`,
      mappedData,
      { ttl: TimeToLive.OneWeek },
    );

    return mappedData;
  }
}

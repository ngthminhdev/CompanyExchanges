import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import * as moment from 'moment';
import { DataSource } from 'typeorm';
import { DB_SERVER } from '../constants';
import { TimeToLive } from '../enums/common.enum';
import { RedisKeys } from '../enums/redis-keys.enum';
import { MssqlService } from '../mssql/mssql.service';
import { UtilCommonTemplate } from '../utils/utils.common';
import { ISIndsDebtSolvency } from './interfaces/Inds-debt-solvency.interface';
import { ISIndsProfitMargins } from './interfaces/inds-profit-margin.interface';
import { IPayoutRatio } from './interfaces/payout-ratio.interface';
import {
  IPEIndustry,
  ISPEPBIndustry
} from './interfaces/pe-pb-industry-interface';
import { ISRotationRatio } from './interfaces/rotation-ratio.interface';
import { MarketService } from './market.service';
import { CashRatioResponse } from './responses/cash-ratio.response';
import { DebtSolvencyResponse } from './responses/debt-solvency.response';
import { IndsProfitMarginsTableResponse } from './responses/indsProfitMarginsTable.response';
import { IndusInterestCoverageResponse } from './responses/indus-interest-coverage.response';
import { InterestRatesOnLoansResponse } from './responses/interest-rates-on-loans.response';
import { PayoutRatioResponse } from './responses/payout-ratio.response';
import { PEIndustryResponse } from './responses/pe-industry.response';
import { PEBResponse } from './responses/peb-ticker.response';
import { PEPBIndustryResponse } from './responses/pepb-industry.response';
import { ProfitMarginResponse } from './responses/profit-margin.response';
import { RotationRatioResponse } from './responses/rotation.response';

@Injectable()
export class FinanceHealthService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly redis: Cache,
    @InjectDataSource(DB_SERVER) private readonly dbServer: DataSource,
    private readonly mssqlService: MssqlService,
    private readonly marketService: MarketService,
  ) {}

  async PBIndustry(ex: string, type: number, order: number, industries: string) {
    const floor = ex == 'ALL' ? ` ('ALL') ` : ` ('${ex}') `;
    const inds: string = industries ? UtilCommonTemplate.getIndustryFilter(industries.split(',')) : '';

    const redisData = await this.redis.get(
      `${RedisKeys.PEPBIndustry}:${floor}:${order}:${type}:${inds}`,
    );
    if (redisData) return redisData;
    
    const query_date: any[] = (await this.mssqlService.query(`select distinct top ${type} yearQuarter as date from RATIO.dbo.ratioInYearQuarter where right(yearQuarter, 1) ${order == 0 ? '<>' : '='} 0 and type = 'INDUSTRY' order by yearQuarter desc`))
      
    const query = `
      select code as industry, yearQuarter as date, PB, PE from RATIO.dbo.ratioInYearQuarter
      where floor IN ${floor}
      and type = 'INDUSTRY'
      and yearQuarter IN ${`(${query_date.map(item => `'${item.date}'`).join(', ')})`}
    `
    
    const data = await this.mssqlService.query<ISPEPBIndustry[]>(query);

    const mappedData = new PEPBIndustryResponse().mapToList(data);

    await this.redis.set(
      `${RedisKeys.PEPBIndustry}:${floor}:${order}:${type}:${inds}`,
      mappedData,
      { ttl: TimeToLive.OneWeek },
    );

    return mappedData;
  }

  async PEIndustry(ex: string, type: number, order: number) {
    const floor = ex == 'ALL' ? ` ('ALL') ` : ` ('${ex}') `;
    const redisData = await this.redis.get(
      `${RedisKeys.PEIndustry}:${floor}:${order}:${type}`,
    );
    if (redisData) return redisData;

    const query_date: any[] = (await this.mssqlService.query(`select distinct top ${type} yearQuarter as date from RATIO.dbo.ratioInYearQuarter where right(yearQuarter, 1) ${order == 0 ? '<>' : '='} 0 and type = 'INDUSTRY' order by yearQuarter desc`))
      
    const query = `
      select code as industry, yearQuarter as date, PB, PE from RATIO.dbo.ratioInYearQuarter
      where floor IN ${floor}
      and type = 'INDUSTRY'
      and yearQuarter IN ${`(${query_date.map(item => `'${item.date}'`).join(', ')})`}
    `

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

    const start_date = (await this.mssqlService.query(`select top 1 date from marketTrade.dbo.tickerTradeVND order by date desc`))[0].date
    const end_date = (await this.mssqlService.query(`select top 1 date from marketTrade.dbo.tickerTradeVND where date >= '${moment(start_date).subtract(1, 'year').format('YYYY-MM-DD')}' order by date asc`))[0].date
    const lastYearQuarterRatio = (await this.mssqlService.query(
      `select top 1 yearQuarter as date from RATIO.dbo.ratioInYearQuarter where right(yearQuarter, 1) <> 0 order by yearQuarter desc`,
    ))[0].date;

    const query: string = `
    WITH temp
    AS (SELECT
      t.code,
      date,
      (closePrice - LEAD(closePrice) OVER (
      PARTITION BY t.code
      ORDER BY date DESC
      )) / LEAD(closePrice) OVER (
      PARTITION BY t.code
      ORDER BY date DESC
      ) * 100 AS perChange
    FROM marketTrade.dbo.tickerTradeVND t
    INNER JOIN marketInfor.dbo.info i
      ON t.code = i.code
    WHERE i.floor IN ${floor}
    AND i.type IN ('STOCK', 'ETF')
    AND i.status = 'listed'
    AND i.LV2 IN (${inds})
    AND date IN ('${moment(start_date).format('YYYY-MM-DD')}', '${moment(end_date).format('YYYY-MM-DD')}')
    ),
    codeData
    AS (SELECT
      *
    FROM temp
    WHERE date = '${moment(start_date).format('YYYY-MM-DD')}'),
    epsChangeAll
    AS (SELECT
      code,
      EPS,
      yearQuarter,
      PE,
      CASE
        WHEN LEAD(EPS) OVER (PARTITION BY code ORDER BY yearQuarter DESC) = 0 THEN 0
        ELSE (EPS - LEAD(EPS) OVER (PARTITION BY code ORDER BY yearQuarter DESC)) / LEAD(EPS) OVER (PARTITION BY code ORDER BY yearQuarter DESC) * 100
      END AS perEPS
    FROM RATIO.dbo.ratioInYearQuarter
    WHERE type = 'STOCK'),
    epsChangeNow
    AS (SELECT
      *
    FROM epsChangeAll
    WHERE yearQuarter = '${lastYearQuarterRatio}')
    SELECT TOP 50
      c.code,
      e.EPS as VND,
      c.perChange as pricePerChange,
      e.perEPS as per,
      e.PE as pData
    FROM codeData c
    INNER JOIN epsChangeNow e
      ON e.code = c.code
    ORDER BY 2 DESC
    `;

    const data = await this.mssqlService.query<any[]>(query);

    const mappedData = new PEBResponse().mapToList(data);

    await this.redis.set(`${RedisKeys.PETicker}:${floor}:${inds}`, mappedData, {
      ttl: TimeToLive.OneWeek,
    });

    return mappedData;
  }

  async PBTicker(ex: string, industries: string[]) {
    const floor = ex == 'ALL' ? ` ('HOSE', 'HNX', 'UPCOM') ` : ` ('${ex}') `;
    const inds: string = UtilCommonTemplate.getIndustryFilter(industries);

    const redisData = await this.redis.get(
      `${RedisKeys.PBTicker}:${floor}:${inds}`,
    );
    if (redisData) return redisData;

    const start_date = (await this.mssqlService.query(`select top 1 date from marketTrade.dbo.tickerTradeVND order by date desc`))[0].date
    const end_date = (await this.mssqlService.query(`select top 1 date from marketTrade.dbo.tickerTradeVND where date >= '${moment(start_date).subtract(1, 'year').format('YYYY-MM-DD')}' order by date asc`))[0].date

    const lastYearQuarterRatio = (await this.mssqlService.query(
      `select top 1 yearQuarter as date from RATIO.dbo.ratioInYearQuarter where right(yearQuarter, 1) <> 0 order by yearQuarter desc`,
    ))[0].date;

    const query: string = `
    WITH temp
    AS (SELECT
      t.code,
      date,
      (closePrice - LEAD(closePrice) OVER (
      PARTITION BY t.code
      ORDER BY date DESC
      )) / LEAD(closePrice) OVER (
      PARTITION BY t.code
      ORDER BY date DESC
      ) * 100 AS perChange
    FROM marketTrade.dbo.tickerTradeVND t
    INNER JOIN marketInfor.dbo.info i
      ON t.code = i.code
    WHERE i.floor IN ${floor}
    AND i.type IN ('STOCK', 'ETF')
    AND i.status = 'listed'
    AND i.LV2 IN (${inds})
    AND date IN ('${moment(start_date).format('YYYY-MM-DD')}', '${moment(end_date).format('YYYY-MM-DD')}')
    ),
    codeData
    AS (SELECT
      *
    FROM temp
    WHERE date = '${moment(start_date).format('YYYY-MM-DD')}'),
    epsChangeAll
    AS (SELECT
      code,
      BVPS,
      yearQuarter,
      PB,
      CASE
        WHEN LEAD(BVPS) OVER (PARTITION BY code ORDER BY yearQuarter DESC) = 0 THEN 0
        ELSE (BVPS - LEAD(BVPS) OVER (PARTITION BY code ORDER BY yearQuarter DESC)) / LEAD(BVPS) OVER (PARTITION BY code ORDER BY yearQuarter DESC) * 100
      END AS perBVPS
    FROM RATIO.dbo.ratioInYearQuarter
    WHERE type = 'STOCK'),
    epsChangeNow
    AS (SELECT
      *
    FROM epsChangeAll
    WHERE yearQuarter = '${lastYearQuarterRatio}')
    SELECT TOP 50
      c.code,
      e.BVPS as VND,
      c.perChange as pricePerChange,
      e.perBVPS as per,
      e.PB as pData
    FROM codeData c
    INNER JOIN epsChangeNow e
      ON e.code = c.code
    ORDER BY 2 DESC
    `

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

    //Lấy ngày gần nhất trong db
    const lastDate = (await this.mssqlService.query(`select top 1 year from financialReport.dbo.financialReport where reportName in (N'Tiền và tương đương tiền', N'Nợ ngắn hạn') order by year desc`))[0]?.year
    
    const date = UtilCommonTemplate.getYearQuarters(2, order, moment(lastDate, 'YYYYQ').add(1, 'quarter').endOf('quarter').toDate());
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

    //Lấy ngày gần nhất trong db
    const lastDate = (await this.mssqlService.query(`select top 1 year from financialReport.dbo.financialReport where reportName in (N'Doanh số thuần', N'Thu nhập lãi thuần') order by year desc`))[0]?.year
    
    const date = UtilCommonTemplate.getYearQuarters(2, order, moment(lastDate, 'YYYYQ').add(1, 'quarter').startOf('quarter').toDate());

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

    const lastDate = await this.mssqlService.query(`select top 1 year from financialReport.dbo.financialReport order by year desc`)

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
                          and year in ${order == 0 ? `('${lastDate[0].year}')` : dateFilter}),
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

  async indsInterestCoverage(ex: string, type: number, order: number) {
    const redisData = await this.redis.get(`${RedisKeys.IndsInterestCoverage}:${ex}:${order}:${type}`)
    if(redisData) return redisData

    const date = UtilCommonTemplate.getYearQuarters(type, order);

    const { dateFilter } = UtilCommonTemplate.getDateFilter(date);

    const query = `
          SELECT
              date,
              industry,
              floor,
              result AS value
          FROM VISUALIZED_DATA.dbo.hesothanhtoanlaivay
          WHERE floor = '${ex}'
          and date IN ${dateFilter}
        `;
        
    const data = await this.mssqlService.query<IndusInterestCoverageResponse[]>(query);

    const dataMapped = IndusInterestCoverageResponse.mapToList(data)
    await this.redis.set(`${RedisKeys.IndsInterestCoverage}:${ex}:${order}:${type}`, dataMapped, {ttl: TimeToLive.OneWeek})
    return dataMapped;
  }

  async interestRatesOnLoans(ex: string, type: number, order: number){
    const redisData = await this.redis.get(`${RedisKeys.interestRatesOnLoans}:${ex}:${order}:${type}`)
    if(redisData) return redisData

    const date = UtilCommonTemplate.getYearQuarters(type, order);
    const { dateFilter } = UtilCommonTemplate.getDateFilter(date);

    const query = `
          SELECT
              date,
              industry,
              floor,
              laisuatvay AS value
          FROM VISUALIZED_DATA.dbo.pb_nganh
          WHERE floor = '${ex}'
          and date IN ${dateFilter}
        `;
        
    const data = await this.mssqlService.query<InterestRatesOnLoansResponse[]>(query);

    const dataMapped = InterestRatesOnLoansResponse.mapToList(data)
    await this.redis.set(`${RedisKeys.interestRatesOnLoans}:${ex}:${order}:${type}`, dataMapped, {ttl: TimeToLive.OneWeek})
    return dataMapped;
  }

  async indsProfitMarginsTable(ex: string, order: number){
    const redisData = await this.redis.get(`${RedisKeys.indsProfitMarginsTable}:${ex}:${order}`)
    // if(redisData) return redisData

    const lastDate = (await this.mssqlService.query(`select top 1 date from VISUALIZED_DATA.dbo.pb_nganh order by date desc`))[0].date

    const date = UtilCommonTemplate.getYearQuarters(1, order, moment(lastDate, 'YYYYQ').add(1, 'quarter').startOf('quarter').toDate());
    const { dateFilter } = UtilCommonTemplate.getDateFilter(date);

    const query = `
          SELECT
              date,
              industry,
              floor,
              gpm,
              npm,
              roa * 100 as roa,
              roe * 100 as roe
          FROM VISUALIZED_DATA.dbo.pb_nganh
          WHERE floor = '${ex}'
          and date IN ${dateFilter}
        `;
        
    const data = await this.mssqlService.query<IndsProfitMarginsTableResponse[]>(query);

    const dataMapped = IndsProfitMarginsTableResponse.mapToList(data)
    await this.redis.set(`${RedisKeys.indsProfitMarginsTable}:${ex}:${order}`, dataMapped, {ttl: TimeToLive.OneWeek})
    return dataMapped;
  }

  async netProfitMarginByIndustries(ex: string, type: number, order: number){
    const redisData = await this.redis.get(`${RedisKeys.netProfitMarginByIndustries}:${ex}:${order}:${type}`)
    if(redisData) return redisData

    const lastDate = (await this.mssqlService.query(`select top 1 date from VISUALIZED_DATA.dbo.pb_nganh order by date desc`))[0].date

    const date = UtilCommonTemplate.getYearQuarters(type, order, moment(lastDate, 'YYYYQ').add(1, 'quarter').startOf('quarter').toDate());
    const { dateFilter } = UtilCommonTemplate.getDateFilter(date);

    const query = `
          SELECT
              date,
              industry,
              floor,
              npm AS value
          FROM VISUALIZED_DATA.dbo.pb_nganh
          WHERE floor = '${ex}'
          and date IN ${dateFilter}
        `;
        
    const data = await this.mssqlService.query<InterestRatesOnLoansResponse[]>(query);

    const dataMapped = InterestRatesOnLoansResponse.mapToList(data)
    await this.redis.set(`${RedisKeys.netProfitMarginByIndustries}:${ex}:${order}:${type}`, dataMapped, {ttl: TimeToLive.OneWeek})
    return dataMapped;
  }
}

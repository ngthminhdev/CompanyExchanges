import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as moment from 'moment';
import { TimeToLive, TimeTypeEnum } from '../enums/common.enum';
import { RedisKeys } from '../enums/redis-keys.enum';
import { MssqlService } from '../mssql/mssql.service';
import { UtilCommonTemplate } from '../utils/utils.common';
import { AverageTradingVolumeResponse } from './responses/averageTradingVolume.response';
import { BusinessResultsResponse } from './responses/businessResults.response';
import { EnterprisesSameIndustryResponse } from './responses/enterprisesSameIndustry.response';
import { EventCalendarResponse } from './responses/eventCalendar.response';
import { FinancialIndicatorsResponse } from './responses/financialIndicators.response';
import { HeaderStockResponse } from './responses/headerStock.response';
import { SearchStockResponse } from './responses/searchStock.response';
import { StatisticsMonthQuarterYearResponse } from './responses/statisticsMonthQuarterYear.response';
import { TradingPriceFluctuationsResponse } from './responses/tradingPriceFluctuations.response';
import { TransactionStatisticsResponse } from './responses/transaction-statistics.response';
import { TransactionDataResponse } from './responses/transactionData.response';

@Injectable()
export class SharesService {
  constructor(
    private readonly mssqlService: MssqlService,
    @Inject(CACHE_MANAGER) private readonly redis: Cache
  ){}
  async searchStock(key_search: string) {
    const query = `
    select code, LV2 as type, companyName as company_name, shortNameEng as short_name, floor from marketInfor.dbo.info
    where code like N'%${UtilCommonTemplate.normalizedString(key_search)}%' or lower(dbo.fn_RemoveVietNamese5(companyName)) like '%${UtilCommonTemplate.normalizedString(key_search)}%'
    `
    const data = await this.mssqlService.query<SearchStockResponse[]>(query)
    const dataMapped = SearchStockResponse.mapToList(data)
    return dataMapped
  }

  async header(stock: string){
    const redisData = await this.redis.get(`${RedisKeys.headerStock}:${stock}`)
    if(redisData) return redisData

    const date = (await this.mssqlService.query(`select top 1 date from RATIO.dbo.ratio where code = '${stock}' order by date desc`))[0]?.date
    if(!date) return {}

    const now = moment(date, 'YYYY-MM-DD').format('YYYY-MM-DD')
    const week = moment(now).subtract(7, 'day').format('YYYY-MM-DD')
    const month = moment((await this.mssqlService.query(`select top 1 date from marketTrade.dbo.indexTradeVND where date <= '${moment(now).subtract(1, 'month').format('YYYY-MM-DD')}'`))[0].date).format('YYYY-MM-DD')
    const year = moment((await this.mssqlService.query(`select top 1 date from marketTrade.dbo.indexTradeVND where date <= '${moment(now).subtract(1, 'year').format('YYYY-MM-DD')}'`))[0].date).format('YYYY-MM-DD')

    const query = `
    WITH temp
    AS (SELECT
      i.code,
      CASE
        WHEN i.floor = 'HOSE' THEN 'VNINDEX'
        ELSE i.floor
      END AS floor,
      i.LV2,
      i.companyName,
      i.companyNameEng,
      o.vnSummary,
      t.closePrice AS price,
      t.change,
      t.perChange,
      t.totalVol AS kldg
    FROM marketInfor.dbo.info i
    INNER JOIN marketInfor.dbo.overview o
      ON i.code = o.code
    INNER JOIN marketTrade.dbo.tickerTradeVND t
      ON i.code = t.code
    WHERE i.code = '${stock}'
    AND t.date = '${now}'),
    pivotted
    AS (SELECT
      [${now}] AS now,
      [${week}] AS week,
      [${month}] AS month,
      [${year}] AS year,
      code
    FROM (SELECT
      closePrice,
      date,
      p.code
    FROM temp p
    INNER JOIN marketTrade.dbo.indexTradeVND i
      ON p.floor = i.code
      AND date IN ('${now}', '${week}', '${month}',
      '${year}')) AS source PIVOT (SUM(closePrice) FOR date IN ([${now}], [${week}], [${month}], [${year}])) AS chuyen),
    pe
    AS (SELECT
      [PRICE_TO_EARNINGS] AS pe,
      [PRICE_TO_BOOK] AS pb,
      [MARKETCAP] AS vh,
      [ROAA_TR_AVG5Q] AS roaa,
      [ROAE_TR_AVG5Q] AS roae,
      code
    FROM (SELECT
      ratioCode,
      value,
      code
    FROM RATIO.dbo.ratio
    WHERE code = '${stock}'
    AND date = '${now}'
    AND ratioCode IN ('MARKETCAP', 'PRICE_TO_BOOK', 'PRICE_TO_EARNINGS')
    UNION
    SELECT TOP 2
      ratioCode,
      value,
      code
    FROM RATIO.dbo.ratio
    WHERE code = '${stock}'
    AND ratioCode IN ('ROAA_TR_AVG5Q', 'ROAE_TR_AVG5Q')
    ORDER BY date DESC) AS source PIVOT (SUM(value) FOR ratioCode IN ([PRICE_TO_EARNINGS], [PRICE_TO_BOOK], [MARKETCAP], [ROAA_TR_AVG5Q], [ROAE_TR_AVG5Q])) AS chuyen)
    SELECT
      t.code, t.floor as exchange, t.LV2 as industry, t.companyName as company, t.companyNameEng as company_eng, t.vnSummary as summary, t.price, t.change, t.perChange, t.kldg,
      ((p.now - p.week) / p.week) * 100 AS p_week,
      ((p.now - p.month) / p.month) * 100 AS p_month,
      ((p.now - p.year) / p.year) * 100 AS p_year,
      e.pb,
      e.pe,
      e.vh,
      e.roaa,
      e.roae
    FROM temp t
    INNER JOIN pivotted p
      ON p.code = t.code
    INNER JOIN pe e
      ON e.code = t.code
    `
    const data = await this.mssqlService.query<HeaderStockResponse[]>(query)
    const dataMapped = new HeaderStockResponse(data[0])
    await this.redis.set(`${RedisKeys.headerStock}:${stock}`, dataMapped, { ttl: TimeToLive.HaftHour })
    return dataMapped
  }

  async transactionStatistics(stock: string) {
    const redisData = await this.redis.get(`${RedisKeys.transactionStatistics}:${stock.toUpperCase()}`)
    if (redisData) return redisData

    const query = `
    WITH temp
    AS (SELECT TOP 6
      closePrice,
      totalVol,
      totalVal,
      t.date,
      closePrice - LEAD(closePrice) OVER (ORDER BY t.date DESC) AS change,
      ((closePrice - LEAD(closePrice) OVER (ORDER BY t.date DESC)) / LEAD(closePrice) OVER (ORDER BY t.date DESC)) * 100 AS perChange
    FROM marketTrade.dbo.tickerTradeVND t
    WHERE t.code = '${stock}'
    ORDER BY date DESC),
    vh
    AS (SELECT TOP 5
      value,
      date
    FROM RATIO.dbo.ratio
    WHERE code = '${stock}'
    AND ratioCode = 'MARKETCAP'
    ORDER BY date DESC),
    fo
    AS (SELECT TOP 5
      buyVal,
      sellVal,
      date
    FROM marketTrade.dbo.[foreign]
    WHERE code = '${stock}'
    ORDER BY date DESC)
    SELECT TOP 5
      closePrice,
      totalVol AS klgd,
      totalVal AS gtdd,
      t.date,
      change,
      perChange,
      value AS vh,
      buyVal AS nn_mua,
      sellVal AS nn_ban
    FROM temp t
    LEFT JOIN vh v
      ON t.date = v.date
    LEFT JOIN fo f
      ON f.date = t.date
    `
    const data = await this.mssqlService.query<TransactionStatisticsResponse[]>(query)
    const dataMapped = TransactionStatisticsResponse.mapToList(data)
    await this.redis.set(`${RedisKeys.transactionStatistics}:${stock.toUpperCase()}`, dataMapped, { ttl: TimeToLive.HaftHour })
    return dataMapped
  }

  private getNameBusinessResults(type: string){
    let name = ``
    switch (type) {
      case 'NH':
        name = `N'Thu nhập lãi thuần', N'Chi phí hoạt động', N'Tổng lợi nhuận trước thuế', N'Lợi nhuận sau thuế thu nhập doanh nghiệp', N'Lãi/Lỗ thuần từ hoạt động dịch vụ'`
        break;
      case 'BH':
        name = `N'7. Doanh thu thuần hoạt động kinh doanh bảo hiểm', N'20. Chi phí bán hàng', N'IX. TỔNG LỢI NHUẬN KẾ TOÁN TRƯỚC THUẾ', N'35. Lợi nhuận sau thuế thu nhập doanh nghiệp', N'8. Chi bồi thường bảo hiểm gốc, trả tiền bảo hiểm'`
        break;
      case 'CK':
        name = `N'Cộng doanh thu hoạt động', N'Cộng doanh thu hoạt động tài chính', N'31. Tổng lợi nhuận trước thuế thu nhập doanh nghiệp', N'XI. LỢI NHUẬN KẾ TOÁN SAU THUẾ TNDN', N'VII. KẾT QUẢ HOẠT ĐỘNG'`
        break;
      default:
        name = `N'3. Doanh thu thuần (1)-(2)', N'5. Lợi nhuận gộp (3)-(4)', N'18. Chi phí thuế TNDN (16)+(17)', N'15. Tổng lợi nhuận kế toán trước thuế (11)+(14)', N'19. Lợi nhuận sau thuế thu nhập doanh nghiệp (15)-(18)'`
        break;
    }
    return name
  }

  private getNameBalanceSheet(type: string){
    let name = ``
    switch (type) {
      case 'NH':
        name = `N'II. Tiền gửi tại NHNN', N'TỔNG CỘNG TÀI SẢN', N'III. Tiền gửi khách hàng', N'VIII. Chứng khoán đầu tư', N'VIII. Vốn chủ sở hữu'`
        break;
      case 'BH':
        name = `N'I. Tiền', N'TỔNG CỘNG TÀI SẢN', N'A. NỢ PHẢI TRẢ', N'IV. Hàng tồn kho', N'I. Vốn chủ sở hữu'`
        break;
      case 'CK':
        name = `N'I. Tài sản tài chính', N'I. Tài sản tài chính dài hạn', N'C. NỢ PHẢI TRẢ', N'TỔNG CỘNG TÀI SẢN', N'D. VỐN CHỦ SỞ HỮU'`
        break;
      default:
        name = `N'A. Tài sản lưu động và đầu tư ngắn hạn', N'B. Tài sản cố định và đầu tư dài hạn', N'A. Nợ phải trả', N'TỔNG CỘNG NGUỒN VỐN', N'I. Vốn chủ sở hữu'`
        break;
    }
    return name
  }

  async businessResults(stock: string, order: number, type: string) {
    const redisData = await this.redis.get(`${RedisKeys.businessResults}:${order}:${stock}:${type}`)
    if(redisData) return redisData

    let group = ``
    let select = ``
    switch (order) {
      case TimeTypeEnum.Quarter:
        select = `value, yearQuarter as date`
        group = `order by yearQuarter desc`
        break;
        case TimeTypeEnum.Year:
          select = `sum(value) as value, cast(year as varchar) + '4' as date`
          group = `group by year, name order by year desc`
          break;
      default:
        break;
    }
    const name = this.getNameBusinessResults(type)
    
    const query = `
      SELECT TOP 20
      LTRIM(RIGHT(name, LEN(name) - CHARINDEX('.', name))) as name,
        ${select}
      FROM financialReport.dbo.financialReportV2 f
      WHERE f.code = '${stock}'
      AND f.type = 'KQKD'
      AND f.name IN (${name})
      ${group}
    `
    const data = await this.mssqlService.query<BusinessResultsResponse[]>(query)
    const dataMapped = BusinessResultsResponse.mapToList(data.reverse())
    await this.redis.set(`${RedisKeys.businessResults}:${order}:${stock}:${type}`, dataMapped, { ttl: TimeToLive.OneDay })
    return dataMapped
  }

  async balanceSheet(stock: string, order: number, type: string){
    const redisData = await this.redis.get(`${RedisKeys.balanceSheet}:${order}:${stock}:${type}`)
    if(redisData) return redisData
    let group = ``
    let select = ``
    switch (order) {
      case TimeTypeEnum.Quarter:
        select = `value, yearQuarter as date`
        group = `order by yearQuarter desc`
        break;
        case TimeTypeEnum.Year:
          select = `sum(value) as value, cast(year as varchar) + '4' as date`
          group = `group by year, name order by year desc`
          break;
      default:
        break;
    }
    const name = this.getNameBalanceSheet(type)
    
    const query = `
      SELECT TOP 20
      LTRIM(RIGHT(name, LEN(name) - CHARINDEX('.', name))) as name,
        ${select}
      FROM financialReport.dbo.financialReportV2 f
      WHERE f.code = '${stock}'
      AND f.type = 'CDKT'
      AND f.name IN (${name})
      ${group}
    `
    const data = await this.mssqlService.query<BusinessResultsResponse[]>(query)
    const dataMapped = BusinessResultsResponse.mapToList(data.reverse())
    await this.redis.set(`${RedisKeys.balanceSheet}:${order}:${stock}:${type}`, dataMapped, { ttl: TimeToLive.OneDay })
    return dataMapped
  }

  async castFlow(stock: string, order: number){
    const redisData = await this.redis.get(`${RedisKeys.castFlow}:${order}:${stock}`)
    if(redisData) return redisData
    let group = ``
    let select = ``
    switch (order) {
      case TimeTypeEnum.Quarter:
        select = `value, yearQuarter as date`
        group = `order by yearQuarter desc`
        break;
        case TimeTypeEnum.Year:
          select = `sum(value) as value, cast(year as varchar) + '4' as date`
          group = `group by year, name order by year desc`
          break;
      default:
        break;
    }
    
    const query = `
      SELECT TOP 20
      LTRIM(RIGHT(name, LEN(name) - CHARINDEX('.', name))) as name,
        ${select}
      FROM financialReport.dbo.financialReportV2 f
      WHERE f.code = '${stock}'
      AND f.type like 'LC%'
      AND f.name IN (N'Lưu chuyển tiền thuần từ hoạt động kinh doanh', N'Lưu chuyển tiền thuần từ hoạt động đầu tư', N'Lưu chuyển tiền thuần trong kỳ', N'Tiền và tương đương tiền đầu kỳ', N'Tiền và tương đương tiền cuối kỳ')
      ${group}
    `
    const data = await this.mssqlService.query<BusinessResultsResponse[]>(query)
    const dataMapped = BusinessResultsResponse.mapToList(data.reverse())
    await this.redis.set(`${RedisKeys.castFlow}:${order}:${stock}`, dataMapped, { ttl: TimeToLive.OneDay })
    return dataMapped
  }

  async financialIndicators(stock: string){
    const redisData = await this.redis.get(`${RedisKeys.financialIndicators}:${stock}`)
    if(redisData) return redisData

    const query = `
    SELECT TOP 4
      EPS as eps,
      BVPS as bvps,
      PE as pe,
      ROE as roe,
      ROA as roa,
      yearQuarter as date
    FROM financialReport.dbo.calBCTC
    WHERE code = '${stock}'
    ORDER BY yearQuarter DESC
    `

    const query_2 = `
    WITH temp
    AS (SELECT
      EPS AS value,
      'EPS' AS name,
      yearQuarter as date
    FROM financialReport.dbo.calBCTC
    WHERE code = '${stock}'
    UNION ALL
    SELECT
      BVPS AS value,
      'BVPS' AS name,
      yearQuarter as date
    FROM financialReport.dbo.calBCTC
    WHERE code = '${stock}'
    UNION ALL
    SELECT
      PE AS value,
      'PE' AS name,
      yearQuarter as date
    FROM financialReport.dbo.calBCTC
    WHERE code = '${stock}'
    UNION ALL
    SELECT
      ROE AS value,
      'ROE' AS name,
      yearQuarter as date
    FROM financialReport.dbo.calBCTC
    WHERE code = '${stock}'
    UNION ALL
    SELECT
      ROA AS value,
      'ROA' AS name,
      yearQuarter as date
    FROM financialReport.dbo.calBCTC
    WHERE code = '${stock}')
    SELECT TOP 20
      *
    FROM temp
    ORDER BY date desc
    `
    
    const data = await this.mssqlService.query<FinancialIndicatorsResponse[]>(query_2)
    const dataMapped = FinancialIndicatorsResponse.mapToList(data.reverse())
    await this.redis.set(`${RedisKeys.financialIndicators}:${stock}`, dataMapped, { ttl: TimeToLive.OneWeek })
    return dataMapped
  }

  async enterprisesSameIndustry(stock: string, exchange: string){
    const redisData = await this.redis.get(`${RedisKeys.enterprisesSameIndustry}:${exchange}:${stock}`)
    if(redisData) return redisData

    const date = await this.mssqlService.query(`select top 1 date from RATIO.dbo.ratio where code = '${stock}' order by date desc`)
    
    const query = `
      WITH temp
      AS (SELECT
        code
      FROM marketInfor.dbo.info
      WHERE LV2 = (SELECT
        LV2
      FROM marketInfor.dbo.info
      WHERE code = '${stock}')
      AND code != '${stock}' and floor = '${exchange}'),
      pivotted
      AS (SELECT
        *
      FROM (SELECT
        value,
        ratioCode,
        temp.code
      FROM temp
      INNER JOIN RATIO.dbo.ratio r
        ON temp.code = r.code
      WHERE ratioCode IN ('PRICE_TO_BOOK', 'PRICE_TO_EARNINGS', 'MARKETCAP')
      AND r.date = '${UtilCommonTemplate.toDate( date[0].date)}') AS source PIVOT (SUM(value) FOR ratioCode IN ([PRICE_TO_BOOK], [PRICE_TO_EARNINGS], [MARKETCAP])) AS chuyen)
      SELECT
        p.code as code,
        t.closePrice,
        t.totalVol as kl,
        PRICE_TO_EARNINGS AS pe,
        PRICE_TO_BOOK AS pb,
        MARKETCAP AS vh
      FROM temp p
      INNER JOIN marketTrade.dbo.tickerTradeVND t
        ON t.code = p.code
      INNER JOIN pivotted
        ON pivotted.code = p.code
      WHERE t.date = '${UtilCommonTemplate.toDate( date[0].date)}'
    `
    const data = await this.mssqlService.query<EnterprisesSameIndustryResponse[]>(query)
    const dataMapped = EnterprisesSameIndustryResponse.mapToList(data)
    await this.redis.set(`${RedisKeys.enterprisesSameIndustry}:${exchange}:${stock}`, dataMapped, { ttl: TimeToLive.HaftHour })
    return dataMapped
  }

  async eventCalendar(stock: string){
    const redisData = await this.redis.get(`${RedisKeys.eventCalendar}:${stock}`)
    if(redisData) return redisData

    const query = `
    SELECT
      NgayDKCC as date,
      NoiDungSuKien as content
    FROM PHANTICH.dbo.LichSukien
    WHERE ticker = '${stock}'
    ORDER BY NgayDKCC DESC
    `
    const data = await this.mssqlService.query<EventCalendarResponse[]>(query)
    const dataMapped = EventCalendarResponse.mapToList(data)
    await this.redis.set(`${RedisKeys.eventCalendar}:${stock}`, dataMapped, { ttl: TimeToLive.OneDay })
    return dataMapped
  }

  async transactionData(stock: string, from: string, to: string){
    const query = `
    WITH temp
    AS (SELECT
      t.code,
      t.date,
      t.perChange,
      t.change,
      t.closePrice,
      t.totalVol,
      t.omVol,
      t.omVal,
      t.highPrice,
      t.lowPrice
    FROM marketTrade.dbo.tickerTradeVND t
    WHERE t.code = '${stock}'
    AND t.date >= '${from}' AND t.date <= '${to}'
    )
    SELECT
      t.*,
      r.value AS vh
    FROM temp t
    LEFT JOIN RATIO.dbo.ratio r
      ON t.code = r.code
      AND t.date = r.date
    
      AND r.ratioCode = 'MARKETCAP'
    ORDER BY t.date DESC
    `
    
    const data = await this.mssqlService.query<TransactionDataResponse[]>(query)
    const dataMapped = TransactionDataResponse.mapToList(data)
    return dataMapped
  }

  async tradingPriceFluctuations(stock: string){
    const redisData = await this.redis.get(`${RedisKeys.tradingPriceFluctuations}:${stock.toUpperCase()}`)
    if(redisData) return redisData
    const date = UtilCommonTemplate.getLastTwoQuarters()

    const now = moment((await this.mssqlService.query(`select top 1 date from marketTrade.dbo.tickerTradeVND where date <= '${moment().format('YYYY-MM-DD')}'`))[0].date).format('YYYY-MM-DD')
    const week = moment((await this.mssqlService.query(`select top 1 date from marketTrade.dbo.tickerTradeVND where date <= '${moment(now).subtract(7, 'day').format('YYYY-MM-DD')}'`))[0].date).format('YYYY-MM-DD')
    const month = moment((await this.mssqlService.query(`select top 1 date from marketTrade.dbo.tickerTradeVND where date <= '${moment(now).subtract(1, 'month').format('YYYY-MM-DD')}'`))[0].date).format('YYYY-MM-DD')
    const year = moment((await this.mssqlService.query(`select top 1 date from marketTrade.dbo.tickerTradeVND where date <= '${moment(now).subtract(1, 'year').format('YYYY-MM-DD')}'`))[0].date).format('YYYY-MM-DD')
    const quarter_start = moment((await this.mssqlService.query(`select top 1 date from marketTrade.dbo.tickerTradeVND where date <= '${moment(date.months[2], 'YYYY/MM/DD').endOf('month').format('YYYY-MM-DD')}'`))[0].date).format('YYYY-MM-DD')
    const quarter_end = moment((await this.mssqlService.query(`select top 1 date from marketTrade.dbo.tickerTradeVND where date <= '${moment(date.months[5], 'YYYY/MM/DD').endOf('month').format('YYYY-MM-DD')}'`))[0].date).format('YYYY-MM-DD')
    const week_52 = moment().subtract('52', 'week').format('YYYY-MM-DD')
    
    const query = `
    WITH temp
    AS (SELECT
      closePrice,
      date,
      code
    FROM marketTrade.dbo.tickerTradeVND
    WHERE date IN ('${now}', '${week}', '${month}', '${quarter_start}', '${quarter_end}', '${year}')
    AND code = '${stock}'),
    pivotted
    AS (SELECT
      code,
      [${now}] AS now,
      [${week}] AS week,
      [${quarter_end}] AS endQ,
      [${quarter_start}] AS startQ,
      [${month}] AS month,
      [${year}] AS year
    FROM temp AS source PIVOT (SUM(closePrice) FOR date IN ([${now}], [${week}], [${quarter_end}], [${quarter_start}], [${month}], [${year}])) AS chuyen),
    mimax
    AS (SELECT
      MAX(closePrice) AS max_price,
      MIN(closePrice) AS min_price,
      '${stock.toUpperCase()}' AS code
    FROM marketTrade.dbo.tickerTradeVND t
    WHERE date >= '${week_52}'
    AND t.code = '${stock}')
    SELECT
      m.min_price,
      m.max_price,
      ((p.now - p.week) / p.week) * 100 AS p_week,
      ((p.now - p.month) / p.month) * 100 AS p_month,
      ((p.endQ - p.startQ) / p.startQ) * 100 AS p_quarter,
      ((p.now - p.year) / p.year) * 100 AS p_year
    FROM pivotted p
    INNER JOIN mimax m
      ON m.code = p.code
    `
    const data = await this.mssqlService.query<TradingPriceFluctuationsResponse[]>(query)
    const dataMapped = new TradingPriceFluctuationsResponse(data[0])
    await this.redis.set(`${RedisKeys.tradingPriceFluctuations}:${stock.toUpperCase()}`, dataMapped, { ttl: TimeToLive.HaftHour })
    return dataMapped
  }
  
  async averageTradingVolume(stock: string){
    const redisData = await this.redis.get(`${RedisKeys.averageTradingVolume}:${stock.toUpperCase()}`)
    if(redisData) return redisData
    const week_52 = moment().subtract('52', 'week').format('YYYY-MM-DD')
    const query = `
    WITH week
    AS (SELECT
      SUM(totalVol) AS week,
      '${stock.toUpperCase()}' AS code
    FROM (SELECT TOP 5
      totalVol
    FROM marketTrade.dbo.tickerTradeVND
    WHERE code = '${stock.toUpperCase()}'
    ORDER BY date DESC) AS sub),
    month
    AS (SELECT
      SUM(totalVol) AS month,
      '${stock.toUpperCase()}' AS code
    FROM (SELECT TOP 25
      totalVol
    FROM marketTrade.dbo.tickerTradeVND
    WHERE code = '${stock.toUpperCase()}'
    ORDER BY date DESC) AS sub),
    quarter
    AS (SELECT
      SUM(totalVol) AS quarter,
      '${stock.toUpperCase()}' AS code
    FROM (SELECT TOP 60
      totalVol
    FROM marketTrade.dbo.tickerTradeVND
    WHERE code = '${stock.toUpperCase()}'
    ORDER BY date DESC) AS sub),
    year
    AS (SELECT
      SUM(totalVol) AS year,
      '${stock.toUpperCase()}' AS code
    FROM (SELECT TOP 250
      totalVol
    FROM marketTrade.dbo.tickerTradeVND
    WHERE code = '${stock.toUpperCase()}'
    ORDER BY date DESC) AS sub),
    minmax
    AS (SELECT
      MAX(totalVol) AS max,
      MIN(totalVol) AS min,
      '${stock.toUpperCase()}' AS code
    FROM marketTrade.dbo.tickerTradeVND
    WHERE code = '${stock.toUpperCase()}'
    AND date >= '${week_52}')
    SELECT
      week,
      month,
      quarter,
      year,
      min,
      max
    FROM week
    INNER JOIN month
      ON week.code = month.code
    INNER JOIN quarter
      ON week.code = quarter.code
    INNER JOIN year
      ON week.code = year.code
    INNER JOIN minmax
      ON week.code = minmax.code
    `
    const data = await this.mssqlService.query(query)
    const dataMapped = new AverageTradingVolumeResponse(data[0])
    await this.redis.set(`${RedisKeys.averageTradingVolume}:${stock.toUpperCase()}`, dataMapped, { ttl: TimeToLive.HaftHour })
    return dataMapped
  }

  async statisticsMonthQuarterYear(stock: string, order: number){
    const redisData = await this.redis.get(`${RedisKeys.statisticsMonthQuarterYear}:${order}:${stock.toUpperCase()}`)
    if(redisData) return redisData
    let group = ``
    let select = ``
    switch (order) {
      case TimeTypeEnum.Month:
        select = `'1/' + cast(month(date) as varchar) + '/' + cast(year(date) as varchar) as date`
        group = `group by month(date), year(date), code
        order by date desc`
        break;
      case TimeTypeEnum.Quarter: 
      select = `
      CASE
        WHEN DATEPART(QUARTER, date) = 1 THEN '31/1/' + CAST(DATEPART(YEAR, date) AS varchar)
        WHEN DATEPART(QUARTER, date) = 2 THEN '30/6/' + CAST(DATEPART(YEAR, date) AS varchar)
        WHEN DATEPART(QUARTER, date) = 3 THEN '30/9/' + CAST(DATEPART(YEAR, date) AS varchar)
        WHEN DATEPART(QUARTER, date) = 4 THEN '31/12/' + CAST(DATEPART(YEAR, date) AS varchar)
      END AS date
      `
      group = `group by datepart(quarter, date), datepart(year, date), code
      order by datepart(year, date) desc, datepart(quarter, date) desc;`
      break
      case TimeTypeEnum.Year:
        select = `'31/12/' + cast(year(date) as varchar) as date`
        group = `group by year(date), code
        order by date desc`
        break
      default:
        break;
    }
    const query = `
    SELECT
      SUM(omVal) AS omVal,
      SUM(omVol) AS omVol,
      SUM(ptVol) AS ptVol,
      SUM(ptVal) AS ptVal,
      COUNT(*) AS total,
      ${select}
    FROM marketTrade.dbo.tickerTradeVND
    WHERE code = 'hpg'
    ${group}
    `
    const data = await this.mssqlService.query<StatisticsMonthQuarterYearResponse[]>(query)
    const dataMapped = StatisticsMonthQuarterYearResponse.mapToList(data)
    await this.redis.set(`${RedisKeys.statisticsMonthQuarterYear}:${order}:${stock.toUpperCase()}`, dataMapped, { ttl: TimeToLive.OneWeek })
    return dataMapped
  }

  async tradingGroupsInvestors(stock: string){
    const query = ``
    const data = await this.mssqlService.query(query)
    return data
  }
}

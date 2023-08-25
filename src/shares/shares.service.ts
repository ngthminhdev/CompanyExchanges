import { CACHE_MANAGER, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as moment from 'moment';
import * as calTech from 'technicalindicators';
import { TimeToLive, TimeTypeEnum } from '../enums/common.enum';
import { RedisKeys } from '../enums/redis-keys.enum';
import { ExceptionResponse } from '../exceptions/common.exception';
import { MssqlService } from '../mssql/mssql.service';
import { NewsEventResponse } from '../news/response/event.response';
import { UtilCommonTemplate } from '../utils/utils.common';
import { AverageTradingVolumeResponse } from './responses/averageTradingVolume.response';
import { BalanceSheetDetailResponse } from './responses/balanceSheetDetail.response';
import { BalanceSheetDetailCircleResponse } from './responses/balanceSheetDetailCircle.response';
import { BusinessPositionRatingResponse } from './responses/businessPositionRating.response';
import { BusinessRatingResponse } from './responses/businessRating.response';
import { BusinessResultDetailResponse } from './responses/businessResultDetail.response';
import { BusinessResultsResponse } from './responses/businessResults.response';
import { CandleChartResponse } from './responses/candleChart.response';
import { CastFlowDetailResponse } from './responses/castFlowDetail.response';
import { EnterprisesSameIndustryResponse } from './responses/enterprisesSameIndustry.response';
import { EventCalendarResponse } from './responses/eventCalendar.response';
import { FinancialHealthRatingResponse } from './responses/financialHealthRating.response';
import { FinancialIndicatorsResponse } from './responses/financialIndicators.response';
import { FinancialIndicatorsDetailResponse } from './responses/financialIndicatorsDetail.response';
import { HeaderStockResponse } from './responses/headerStock.response';
import { IndividualInvestorBenefitsRatingResponse } from './responses/individualInvestorBenefitsRating.response';
import { NewsStockResponse } from './responses/newsStock.response';
import { SearchStockResponse } from './responses/searchStock.response';
import { StatisticsMonthQuarterYearResponse } from './responses/statisticsMonthQuarterYear.response';
import { TechniqueRatingResponse } from './responses/techniqueRating.response';
import { TradingGroupsInvestorsResponse } from './responses/tradingGroupsInvestors.response';
import { TradingPriceFluctuationsResponse } from './responses/tradingPriceFluctuations.response';
import { TransactionStatisticsResponse } from './responses/transaction-statistics.response';
import { TransactionDataResponse } from './responses/transactionData.response';
import { ValuationRatingResponse } from './responses/valuationRating.response';

@Injectable()
export class SharesService {
  constructor(
    private readonly mssqlService: MssqlService,
    @Inject(CACHE_MANAGER) private readonly redis: Cache
  ) { }
  async searchStock(key_search: string) {
    const query = `
    select code, LV2 as type, companyName as company_name, shortNameEng as short_name, floor from marketInfor.dbo.info
    where code like N'%${UtilCommonTemplate.normalizedString(key_search)}%' or lower(dbo.fn_RemoveVietNamese5(companyName)) like '%${UtilCommonTemplate.normalizedString(key_search)}%'
    `
    const data = await this.mssqlService.query<SearchStockResponse[]>(query)
    const dataMapped = SearchStockResponse.mapToList(data)
    return dataMapped
  }

  async header(stock: string, type: string) {
    const redisData = await this.redis.get(`${RedisKeys.headerStock}:${stock}:${type}`)
    if (redisData) return redisData

    const date = (await this.mssqlService.query(`select top 1 date from RATIO.dbo.ratio where code = '${stock}' order by date desc`))[0]?.date
    if (!date) return {}

    const dateTickerTrade = (await this.mssqlService.query(`select top 1 date from marketTrade.dbo.tickerTradeVND where code = '${stock}' order by date desc`))[0]?.date

    const isStock = (await this.mssqlService.query(`select top 1 case when LV2 = N'Ngân hàng' then 'NH' when LV2 = N'Dịch vụ tài chính' then 'CK' when LV2 = N'Bảo hiểm' then 'BH' else 'CTCP' end as LV2 from marketInfor.dbo.info where code = '${stock}'`))[0]?.LV2
    if (!isStock || isStock != type.toUpperCase()) throw new ExceptionResponse(HttpStatus.BAD_REQUEST, 'stock not found')

    const now = moment(date, 'YYYY-MM-DD').format('YYYY-MM-DD')

    const week = moment(now).subtract(7, 'day').format('YYYY-MM-DD')
    const month = moment((await this.mssqlService.query(`select top 1 date from marketTrade.dbo.indexTradeVND where date <= '${moment(now).subtract(1, 'month').format('YYYY-MM-DD')}'`))[0].date).format('YYYY-MM-DD')
    const year = moment((await this.mssqlService.query(`select top 1 date from marketTrade.dbo.indexTradeVND where date <= '${moment(now).subtract(1, 'year').format('YYYY-MM-DD')}'`))[0].date).format('YYYY-MM-DD')

    const query = `
    WITH temp
    AS (SELECT top 1
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
    INNER JOIN tradeIntraday.dbo.tickerTradeVNDIntraday t
      ON i.code = t.code
    WHERE i.code = '${stock}'
    AND t.date = '${UtilCommonTemplate.toDate(dateTickerTrade)}'
    order by t.timeInday desc
    ),
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
    await this.redis.set(`${RedisKeys.headerStock}:${stock}:${type}`, dataMapped, { ttl: TimeToLive.Minute })
    return dataMapped
  }

  async candleChart(stock: string) {
    const query = `select distinct openPrice, closePrice, highPrice, lowPrice, totalVol, timeInday as time from tradeIntraday.dbo.tickerTradeVNDIntraday where code = '${stock}' and date = (select MAX(date) from tradeIntraday.dbo.tickerTradeVNDIntraday where code = '${stock}') order by time asc`
    const data = await this.mssqlService.query<CandleChartResponse[]>(query)
    const dataMapped = CandleChartResponse.mapToList(data)
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

  private getNameBusinessResults(type: string) {
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

  private getNameBalanceSheet(type: string) {
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
    if (redisData) return redisData

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

  async balanceSheet(stock: string, order: number, type: string) {
    const redisData = await this.redis.get(`${RedisKeys.balanceSheet}:${order}:${stock}:${type}`)
    if (redisData) return redisData
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

  async castFlow(stock: string, order: number) {
    const redisData = await this.redis.get(`${RedisKeys.castFlow}:${order}:${stock}`)
    if (redisData) return redisData
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

  async financialIndicators(stock: string) {
    const redisData = await this.redis.get(`${RedisKeys.financialIndicators}:${stock}`)
    if (redisData) return redisData

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

  async enterprisesSameIndustry(stock: string, exchange: string) {
    const redisData = await this.redis.get(`${RedisKeys.enterprisesSameIndustry}:${exchange}:${stock}`)
    if (redisData) return redisData

    const date = await this.mssqlService.query(`select top 1 date from RATIO.dbo.ratio where code = '${stock}' and ratioCode = 'PRICE_TO_BOOK' order by date desc`)

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
      AND r.date = '${UtilCommonTemplate.toDate(date[0].date)}') AS source PIVOT (SUM(value) FOR ratioCode IN ([PRICE_TO_BOOK], [PRICE_TO_EARNINGS], [MARKETCAP])) AS chuyen)
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
      WHERE t.date = '${UtilCommonTemplate.toDate(date[0].date)}'
    `
    const data = await this.mssqlService.query<EnterprisesSameIndustryResponse[]>(query)
    const dataMapped = EnterprisesSameIndustryResponse.mapToList(data)
    await this.redis.set(`${RedisKeys.enterprisesSameIndustry}:${exchange}:${stock}`, dataMapped, { ttl: TimeToLive.HaftHour })
    return dataMapped
  }

  async eventCalendar(stock: string) {
    const redisData = await this.redis.get(`${RedisKeys.eventCalendar}:${stock}`)
    if (redisData) return redisData

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

  async transactionData(stock: string, from: string, to: string) {
    const query = `
    WITH temp
    AS (SELECT
      t.code,
      t.date,
      t.perChange,
      t.change,
      t.closePrice,
      t.totalVol,
      t.totalVal,
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

  async tradingPriceFluctuations(stock: string) {
    const redisData = await this.redis.get(`${RedisKeys.tradingPriceFluctuations}:${stock.toUpperCase()}`)
    if (redisData) return redisData
    const date = UtilCommonTemplate.getLastTwoQuarters()

    const now = moment((await this.mssqlService.query(`select top 1 date from marketTrade.dbo.tickerTradeVND where date <= '${moment().format('YYYY-MM-DD')}'`))[0].date).format('YYYY-MM-DD')
    const week = moment((await this.mssqlService.query(`select top 1 date from marketTrade.dbo.tickerTradeVND where date <= '${moment(now).subtract(7, 'day').format('YYYY-MM-DD')}'`))[0].date).format('YYYY-MM-DD')
    const month = moment((await this.mssqlService.query(`select top 1 date from marketTrade.dbo.tickerTradeVND where date <= '${moment(now).subtract(1, 'month').format('YYYY-MM-DD')}'`))[0].date).format('YYYY-MM-DD')
    const year = moment((await this.mssqlService.query(`select top 1 date from marketTrade.dbo.tickerTradeVND where date <= '${moment(now).subtract(1, 'year').format('YYYY-MM-DD')}'`))[0].date).format('YYYY-MM-DD')
    const quarter_start = moment((await this.mssqlService.query(`select top 1 date from marketTrade.dbo.tickerTradeVND where date <= '${moment(date.months[2], 'YYYY/MM/DD').endOf('month').format('YYYY-MM-DD')}'`))[0].date).format('YYYY-MM-DD')
    const quarter_end = moment((await this.mssqlService.query(`select top 1 date from marketTrade.dbo.tickerTradeVND where date <= '${moment(date.months[5], 'YYYY/MM/DD').endOf('month').format('YYYY-MM-DD')}'`))[0].date).format('YYYY-MM-DD')
    const week_52 = moment().subtract('52', 'week').format('YYYY-MM-DD')

    let pivot = ``
    if (month == quarter_end) {
      pivot = `[${now}], [${week}], [${quarter_start}], [${month}], [${year}]`
    } else if (month == quarter_start) {
      pivot = `[${now}], [${week}], [${quarter_end}], [${month}], [${year}]`
    } else {
      pivot = `[${now}], [${week}], [${quarter_end}], [${quarter_start}], [${month}], [${year}]`
    }

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
    FROM temp AS source PIVOT (SUM(closePrice) FOR date IN (${pivot})) AS chuyen),
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

  async averageTradingVolume(stock: string) {
    const redisData = await this.redis.get(`${RedisKeys.averageTradingVolume}:${stock.toUpperCase()}`)
    if (redisData) return redisData
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

  async statisticsMonthQuarterYear(stock: string, order: number) {
    const redisData = await this.redis.get(`${RedisKeys.statisticsMonthQuarterYear}:${order}:${stock.toUpperCase()}`)
    if (redisData) return redisData

    let group = ``
    let select = ``
    switch (order) {
      case TimeTypeEnum.Month:
        select = `'1/' + cast(month(date) as varchar) + '/' + cast(year(date) as varchar) as date`
        group = `group by month(date), year(date), code
        order by year(date) desc, month(date) desc`
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

  async tradingGroupsInvestors(stock: string) {
    const redisData = await this.redis.get(`${RedisKeys.tradingGroupsInvestors}:${stock.toUpperCase()}`)
    if (redisData) return redisData
    const query = `
    WITH kn
    AS (SELECT TOP 50
      SUM(netVol) AS kn,
      date
    FROM marketTrade.dbo.[foreign]
    GROUP BY date
    ORDER BY date DESC),
    td
    AS (SELECT TOP 50
      SUM(netVol) AS td,
      date
    FROM marketTrade.dbo.[proprietary]
    GROUP BY date
    ORDER BY date DESC),
    cn
    AS (SELECT TOP 50
      SUM(netVol) AS cn,
      date
    FROM marketTrade.dbo.[retail]
    GROUP BY date
    ORDER BY date DESC),
    price
    AS (SELECT TOP 50
      closePrice,
      date
    FROM marketTrade.dbo.tickerTradeVND
    WHERE code = '${stock}'
    ORDER BY date DESC),
    stock
    AS (SELECT TOP 1
      CASE
        WHEN floor = 'HOSE' THEN 'VNINDEX'
        ELSE floor
      END AS floor
    FROM marketInfor.dbo.info
    WHERE code = '${stock}'),
    temp
    AS (SELECT
      kn,
      td,
      cn,
      kn.date,
      closePrice AS price
    FROM kn
    LEFT JOIN td
      ON td.date = kn.date
    LEFT JOIN cn
      ON cn.date = kn.date

    LEFT JOIN price p
      ON p.date = kn.date)
    SELECT
      i.closePrice AS price_exchange,
      temp.*
    FROM marketTrade.dbo.indexTradeVND i
    INNER JOIN stock
      ON i.code = stock.floor
    INNER JOIN temp
      ON temp.date = i.date
    `
    const data = await this.mssqlService.query<TradingGroupsInvestorsResponse[]>(query)
    const dataMapped = TradingGroupsInvestorsResponse.mapToList(data.reverse())
    await this.redis.set(`${RedisKeys.tradingGroupsInvestors}:${stock.toUpperCase()}`, dataMapped, { ttl: TimeToLive.HaftHour })
    return dataMapped
  }

  async eventCalendarDetail(stock: string, type: number) {
    let query = ``
    switch (type) {
      case 0:
        query = `select ticker as code, san as exchange, NgayGDKHQ as date_gdkhq, NgayDKCC as date_dkcc, case when NgayThucHien = '1900-01-01' then null else NgayThucHien end AS date, NoiDungSuKien as content, LoaiSuKien as type from PHANTICH.dbo.LichSukien where ticker = '${stock}' order by NgayDKCC desc`
        break;
      case 1:
        query = `
        with temp as (select code from marketInfor.dbo.info where LV2 = (select LV2 from marketInfor.dbo.info where code = '${stock}'))
        select l.ticker as code, san as exchange, NgayGDKHQ as date_gdkhq, NgayDKCC as date_dkcc, case when NgayThucHien = '1900-01-01' then null else NgayThucHien end AS date, NoiDungSuKien as content, LoaiSuKien as type from PHANTICH.dbo.LichSukien l inner join temp t on t.code = l.ticker
        order by NgayDKCC desc
        `
        break
      case 2:
        query = `select ticker as code, san as exchange, NgayGDKHQ as date_gdkhq, NgayDKCC as date_dkcc, case when NgayThucHien = '1900-01-01' then null else NgayThucHien end AS date, NoiDungSuKien as content, LoaiSuKien as type from PHANTICH.dbo.LichSukien order by NgayDKCC desc`
        break
      default:
        break;
    }

    const data = await this.mssqlService.query<NewsEventResponse[]>(query)
    const dataMapped = NewsEventResponse.mapToList(data)
    return dataMapped
  }

  async newsStock(stock: string, type: number) {
    let query = ``
    switch (type) {
      case 0:
        query = `
        SELECT
            Title as title,
            Href as href
        FROM macroEconomic.dbo.TinTuc n
        WHERE Href NOT LIKE 'https://cafef.vn%'  
        AND Href NOT LIKE 'https://ndh.vn%'
        AND TickerTitle = '${stock}'
        ORDER BY n.date DESC
        `
        break;
      case 1:
        query = `
      WITH temp
      AS (SELECT
        code
      FROM marketInfor.dbo.info
      WHERE LV2 = (SELECT
        LV2
      FROM marketInfor.dbo.info
      WHERE code = '${stock}'))
      SELECT
        Title AS title,
        Href AS href
      FROM macroEconomic.dbo.TinTuc t
      INNER JOIN temp i
        ON t.TickerTitle = i.code
      WHERE Href NOT LIKE 'https://cafef.vn%'
      AND Href NOT LIKE 'https://ndh.vn%'
      ORDER BY t.date DESC
      `
        break
      case 2:
        query = `
        SELECT
          Title AS title,
          Href AS href
        FROM macroEconomic.dbo.TinTuc
        WHERE Href NOT LIKE 'https://cafef.vn%'
        AND Href NOT LIKE 'https://ndh.vn%'
        ORDER BY date DESC
        `
        break
      default:
        break;
    }

    const data = await this.mssqlService.query<NewsStockResponse[]>(query)
    const dataMapped = NewsStockResponse.mapToList(data)
    return dataMapped
  }

  private getChiTieuLCTT(type: string, is_chart: number) {
    let chiTieu = ``
    let top = 0
    let cate = ``
    if (is_chart) {
      switch (type) {
        case 'Ngân hàng':
          chiTieu = `N' - Thu nhập lãi và các khoản thu nhập tương tự nhận được',
          N'Lưu chuyển tiền thuần từ hoạt động kinh doanh',
          N'Lưu chuyển tiền thuần từ hoạt động đầu tư',
          N'LƯU CHUYỂN TIỀN THUẦN TRONG KỲ',
          N'Tiền và tương đương tiền đầu kỳ',
          N'Tiền và tương đương tiền cuối kỳ'`
          top = 48
          cate = `LCTT`
          break;
        case 'Bảo hiểm':
          chiTieu = `N'Lưu chuyển tiền thuần từ hoạt động kinh doanh',
            N'Lưu chuyển tiền thuần từ hoạt động đầu tư',
            N'Lưu chuyển tiền thuần từ hoạt động tài chính',
            N'Lưu chuyển tiền thuần trong kỳ',
            N'Tiền và tương đương tiền đầu kỳ',
            N'Tiền và tương đương tiền cuối kỳ'`
          top = 48
          cate = `LCGT`
          break;
        case 'Dịch vụ tài chính':
          chiTieu = `
          N'Lưu chuyển tiền thuần từ hoạt động đầu tư',
        N'Lưu chuyển tiền thuần từ hoạt động kinh doanh',
        N'Lưu chuyển tiền thuần từ hoạt động tài chính',
        N'V. Tiền và các khoản tương đương tiền đầu kỳ',
        N'VI. Tiền và các khoản tương đương tiền cuối kỳ'
        `
          top = 40
          cate = `LCGT`
          break
        default:
          chiTieu = `
          N'Lưu chuyển tiền thuần từ hoạt động kinh doanh',
          N'Lưu chuyển tiền thuần từ hoạt động đầu tư',
          N'Lưu chuyển tiền thuần từ hoạt động tài chính',
          N'Lưu chuyển tiền thuần trong kỳ',
          N'Tiền và tương đương tiền đầu kỳ',
          N'Tiền và tương đương tiền cuối kỳ'
          `
          top = 48
          cate = `LCGT`
          break;
      }
      const sort = `case ${chiTieu.split(',').map((item, index) => `when name = ${item.replace(/\n/g, "").trim()} then ${index}`).join(' ')} end as row_num`
      return { chiTieu, top, cate, sort }
    }
    switch (type) {
      case 'Ngân hàng':
        chiTieu = `N'I. Lưu chuyển tiền từ hoạt động kinh doanh',
        N' - Thu nhập lãi và các khoản thu nhập tương tự nhận được',
        N'- Chi phí lãi và các chi phí tương tự đã trả',
        N' - Thu nhập từ hoạt động dịch vụ nhận được',
        N'- Chênh lệch số tiền thực thu/ thực chi từ hoạt động kinh doanh (ngoại tệ, vàng bạc, chứng khoán)',
        N'- Thu nhập khác',
        N'- Tiền thu các khoản nợ đã được xử lý xóa, bù đắp bằng nguồn rủi ro',
        N'- Tiền chi trả cho nhân viên và hoạt động quản lý, công vụ',
        N'- Tiền thuế thu nhập thực nộp trong kỳ',
        N'Lưu chuyển tiền thuần từ hoạt động kinh doanh trước những thay đổi về tài sản và vốn lưu động',
        N'Lưu chuyển tiền thuần từ hoạt động kinh doanh',
        N'II. Lưu chuyển tiền từ hoạt động đầu tư',
        N'- Mua sắm TSCĐ',
        N'- Tiền thu từ thanh lý, nhượng bán TSCĐ',
        N'- Tiền chi từ thanh lý, nhượng bán TSCĐ',
        N'- Tiền thu cổ tức và lợi nhuận được chia từ các khoản đầu tư, góp vốn dài hạn',
        N'Lưu chuyển tiền thuần từ hoạt động đầu tư',
        N'Lưu chuyển tiền thuần trong kỳ',
        N'Tiền và tương đương tiền đầu kỳ',
        N'Tiền và tương đương tiền cuối kỳ'`
        top = 160
        cate = `LCTT`
        break;
      case 'Bảo hiểm':
        chiTieu = `
        N'I. Lưu chuyển tiền từ hoạt động kinh doanh',
        N'1. Lợi nhuận trước thuế',
        N'2. Điều chỉnh qua các khoản',
        N'3. Lợi nhuận từ hoạt động kinh doanh trước thay đổi vốn lưu động',
        N'Lưu chuyển tiền thuần từ hoạt động kinh doanh',
        N'II. Lưu chuyển tiền từ hoạt động đầu tư',
        N'1. Tiền chi để mua sắm, xây dựng TSCĐ và các TS dài hạn khác',
        N'2. Tiền thu từ thanh lý, nhượng bán TSCĐ và các TS dài hạn khác',
        N'3. Tiền chi cho vay, mua các công cụ nợ của các đơn vị khác ',
        N'4. Tiền thu hồi cho vay, bán lại các công cụ nợ của đơn vị khác',
        N'5. Tiền chi đầu tư góp vốn vào đơn vị khác',
        N'6. Tiền thu hồi đầu tư góp vốn vào đơn vị khác',
        N'7. Tiền thu lãi cho vay, cổ tức và lợi nhuận được chia',
        N'Lưu chuyển tiền thuần từ hoạt động đầu tư',
        N'III. Lưu chuyển tiền từ hoạt động tài chính',
        N'1. Tiền thu từ phát hành cổ phiếu',
        N'2. Tiền chi trả vốn góp cho các chủ sở hữu, mua lại cổ phiếu của doanh nghiệp đã phát hành',
        N'3. Tiền vay ngắn hạn, dài hạn nhận được',
        N'4. Tiền chi trả nợ gốc vay',
        N'5. Tiền chi trả nợ thuê tài chính',
        N'6. Cổ tức, lợi nhuận đã trả cho chủ sở hữu',
        N'Lưu chuyển tiền thuần từ hoạt động tài chính',
        N'Lưu chuyển tiền thuần trong kỳ',
        N'Tiền và tương đương tiền đầu kỳ',
        N'Ảnh hưởng của thay đổi tỷ giá hối đoái quy đổi ngoại tệ',
        N'Tiền và tương đương tiền cuối kỳ'`
        top = 208
        cate = 'LCGT'
        break
      case 'Dịch vụ tài chính':
        chiTieu = `
          N'I. LƯU CHUYỂN TIỀN TỪ HOẠT ĐỘNG KINH DOANH',
        N'1. Lợi nhuận trước Thuế Thu nhập doanh nghiệp',
        N'- Khấu hao TSCĐ',
        N'3. Tăng các chi phí phi tiền tệ',
        N'4. Giảm các doanh thu phi tiền tệ',
        N'5. Thay đổi tài sản và nợ phải trả hoạt động',
        N'6. Lợi nhuận từ hoạt động kinh doanh trước thay đổi vốn lưu động',
        N'Lưu chuyển tiền thuần từ hoạt động kinh doanh',
        N'II. Lưu chuyển tiền từ hoạt động đầu tư',
        N'1. Tiền chi để mua sắm, xây dựng TSCĐ, BĐSĐT và các tài sản khác',
        N'2. Tiền thu từ thanh lý, nhượng bán TSCĐ, BĐSĐT và các tài sản khác',
        N'3. Tiền chi đầu tư vốn vào công ty con, công ty liên doanh, liên kết và đầu tư khác',
        N'4. Tiền thanh lý các khoản đầu tư vào công ty con, công ty liên doanh, liên kết và đầu tư khác',
        N'5.Tiền thu về cổ tức và lợi nhuận được chia',
        N'Lưu chuyển tiền thuần từ hoạt động đầu tư',
        N'III. Lưu chuyển tiền từ hoạt động tài chính',
        N'1. Tiền thu từ phát hành cổ phiếu, nhận vốn góp của chủ sở hữu',
        N'2. Tiền chi trả vốn góp cho chủ sở hữu, mua lại cổ phiếu quỹ',
        N'3. Tiền vay gốc',
        N'4. Tiền chi trả nợ gốc vay',
        N'6. Cổ tức, lợi nhuận đã trả cho chủ sở hữu',
        N'Lưu chuyển tiền thuần từ hoạt động tài chính',
        N'IV. Tăng/giảm tiền thuần trong kỳ',
        N'V. Tiền và các khoản tương đương tiền đầu kỳ',
        N'Tiền gửi ngân hàng đầu kỳ',
        N'Các khoản tương đương tiền',
        N'Ảnh hưởng của thay đổi tỷ giá hối đoái quy đổi ngoại tệ',
        N'VI. Tiền và các khoản tương đương tiền cuối kỳ',
        N'Tiền gửi ngân hàng cuối kỳ'
          `
        top = 248
        cate = `LCGT`
        break
      default:
        chiTieu = `
        N'I. Lưu chuyển tiền từ hoạt động kinh doanh',
        N'1. Lợi nhuận trước thuế',
        N'- Khấu hao TSCĐ',
        N'- Các khoản dự phòng',
        N'- Lãi, lỗ từ hoạt động đầu tư',
        N'- Chi phí lãi vay',
        N'3. Lợi nhuận từ hoạt động kinh doanh trước thay đổi vốn lưu động',
        N'Lưu chuyển tiền thuần từ hoạt động kinh doanh',
        N'II. Lưu chuyển tiền từ hoạt động đầu tư',
        N'1. Tiền chi để mua sắm, xây dựng TSCĐ và các tài sản dài hạn khác',
        N'2. Tiền thu từ thanh lý, nhượng bán TSCĐ và các tài sản dài hạn khác',
        N'3. Tiền chi cho vay, mua các công cụ nợ của đơn vị khác',
        N'4. Tiền thu hồi cho vay, bán lại các công cụ nợ của các đơn vị khác',
        N'5. Đầu tư góp vốn vào công ty liên doanh liên kết',
        N'6. Chi đầu tư ngắn hạn',
        N'7. Tiền chi đầu tư góp vốn vào đơn vị khác',
        N'8. Tiền thu hồi đầu tư góp vốn vào đơn vị khác',
        N'9. Lãi tiền gửi đã thu',
        N'10. Tiền thu lãi cho vay, cổ tức và lợi nhuận được chia',
        N'11. Tiền chi mua lại phần vốn góp của các cổ đông thiểu số',
        N'Lưu chuyển tiền thuần từ hoạt động đầu tư',
        N'III. Lưu chuyển tiền từ hoạt động tài chính',
        N'1. Tiền thu từ phát hành cổ phiếu, nhận vốn góp của chủ sở hữu',
        N'3. Tiền vay ngắn hạn, dài hạn nhận được',
        N'4. Tiền chi trả nợ gốc vay',
        N'8. Cổ tức, lợi nhuận đã trả cho chủ sở hữu',
        N'Lưu chuyển tiền thuần từ hoạt động tài chính',
        N'Lưu chuyển tiền thuần trong kỳ',
        N'Tiền và tương đương tiền đầu kỳ',
        N'Ảnh hưởng của thay đổi tỷ giá hối đoái quy đổi ngoại tệ',
        N'Tiền và tương đương tiền cuối kỳ'
        `
        cate = `LCGT`
        top = 248
        break;
    }
    const sort = type != 'Dịch vụ tài chính' ?
      `case ${chiTieu.split(`',`).map((item, index) => index !== chiTieu.split(`',`).length - 1 ? `when name = ${item.replace(/\n/g, "").trim()}' then ${index}` : `when name = ${item.replace(/\n/g, "").trim()} then ${index}`).join(' ')} end as row_num`
      : `CASE
    WHEN name = N'I. LƯU CHUYỂN TIỀN TỪ HOẠT ĐỘNG KINH DOANH' THEN 0
    WHEN name = N'1. Lợi nhuận trước Thuế Thu nhập doanh nghiệp' THEN 1
    WHEN name = N'- Khấu hao TSCĐ' THEN 2
    WHEN name = N'3. Tăng các chi phí phi tiền tệ' THEN 3
    WHEN name = N'4. Giảm các doanh thu phi tiền tệ' THEN 4
    WHEN name = N'5. Thay đổi tài sản và nợ phải trả hoạt động' THEN 5
    WHEN name = N'6. Lợi nhuận từ hoạt động kinh doanh trước thay đổi vốn lưu động' THEN 6
    WHEN name = N'Lưu chuyển tiền thuần từ hoạt động kinh doanh' THEN 7
    WHEN name = N'II. Lưu chuyển tiền từ hoạt động đầu tư' THEN 8
    WHEN name = N'1. Tiền chi để mua sắm, xây dựng TSCĐ, BĐSĐT và các tài sản khác' THEN 9
    WHEN name = N'2. Tiền thu từ thanh lý, nhượng bán TSCĐ, BĐSĐT và các tài sản khác' THEN 10
    WHEN name = N'3. Tiền chi đầu tư vốn vào công ty con, công ty liên doanh, liên kết và đầu tư khác' THEN 11
    WHEN name = N'4. Tiền thanh lý các khoản đầu tư vào công ty con, công ty liên doanh, liên kết và đầu tư khác' THEN 12
    WHEN name = N'5.Tiền thu về cổ tức và lợi nhuận được chia' THEN 13
    WHEN name = N'Lưu chuyển tiền thuần từ hoạt động đầu tư' THEN 14
    WHEN name = N'III. Lưu chuyển tiền từ hoạt động tài chính' THEN 15
    WHEN name = N'1. Tiền thu từ phát hành cổ phiếu, nhận vốn góp của chủ sở hữu' THEN 16
    WHEN name = N'2. Tiền chi trả vốn góp cho chủ sở hữu, mua lại cổ phiếu quỹ' THEN 17
    WHEN name = N'3. Tiền vay gốc' THEN 18
    WHEN name = N'4. Tiền chi trả nợ gốc vay' THEN 19
    WHEN name = N'6. Cổ tức, lợi nhuận đã trả cho chủ sở hữu' THEN 20
    WHEN name = N'Lưu chuyển tiền thuần từ hoạt động tài chính' THEN 21
    WHEN name = N'IV. Tăng/giảm tiền thuần trong kỳ' THEN 22
    WHEN name = N'V. Tiền và các khoản tương đương tiền đầu kỳ' THEN 23
    WHEN name = N'Tiền gửi ngân hàng đầu kỳ' THEN 24
    WHEN name = N'Các khoản tương đương tiền' and id = 502 then 25
    WHEN name = N'Ảnh hưởng của thay đổi tỷ giá hối đoái quy đổi ngoại tệ' and id = 503 then 26
    WHEN name = N'VI. Tiền và các khoản tương đương tiền cuối kỳ' THEN 27
    WHEN name = N'Tiền gửi ngân hàng cuối kỳ' THEN 28
    WHEN name = N'Các khoản tương đương tiền' and id = 602 then 29
     WHEN name = N'Ảnh hưởng của thay đổi tỷ giá hối đoái quy đổi ngoại tệ' and id = 603 then 30
  END AS row_num`
    return { chiTieu, top, cate, sort }
  }

  async castFlowDetail(stock: string, order: number, is_chart: number) {
    const redisData = await this.redis.get(`${RedisKeys.castFlowDetail}:${order}:${stock}:${is_chart}`)
    if (redisData) return redisData

    const LV2 = await this.mssqlService.query(`select top 1 LV2 from marketInfor.dbo.info where code = '${stock}'`)
    const { chiTieu, top, cate, sort } = this.getChiTieuLCTT(LV2[0].LV2, is_chart)

    let group = ``
    let select = ``
    switch (order) {
      case TimeTypeEnum.Quarter:
        group = `order by yearQuarter desc`
        select = `name, value, yearQuarter as date, id`
        break;
      case TimeTypeEnum.Year:
        group = `group by name, id, year order by year desc`
        select = `year as date, name, sum(value) as value, id`
        break;
      default:
        break;
    }

    const query = `
    with temp as (SELECT TOP ${top} ${select}
    FROM financialReport.dbo.financialReportV2
    WHERE code = '${stock}'
    AND name IN (${chiTieu})
    AND yearQuarter NOT LIKE '%0'
    AND type = '${cate}'
    ${group})
    select 
    case when CHARINDEX('-', name) != 0 then LTRIM(RIGHT(name, LEN(name) - CHARINDEX('-', name)))
    when name = N'Các khoản tương đương tiền' and id = 502 then 'Cac khoan tuong duong tien dau ky'
    when name = N'Các khoản tương đương tiền' and id = 602 then 'Cac khoan tuong duong tien cuoi ky'
    when name = N'Ảnh hưởng của thay đổi tỷ giá hối đoái quy đổi ngoại tệ' and id = 503 then 'Anh huong dau ky'
    when name = N'Ảnh hưởng của thay đổi tỷ giá hối đoái quy đổi ngoại tệ' and id = 603 then 'Anh huong cuoi ky'
    else LTRIM(RIGHT(name, LEN(name) - CHARINDEX('.', name))) end as name,
    value,
    date,
    ${sort}
    from temp
    order by date asc, row_num asc
    `
    const data = await this.mssqlService.query<CastFlowDetailResponse[]>(query)
    const dataMapped = CastFlowDetailResponse.mapToList(data, is_chart, LV2[0].LV2)
    await this.redis.set(`${RedisKeys.castFlowDetail}:${order}:${stock}:${is_chart}`, dataMapped, { ttl: TimeToLive.OneWeek })
    return dataMapped
  }

  private getChiTieuKQKD(type: string, is_chart: number) {
    let chiTieu = ``
    let top = 0
    if (is_chart) {
      switch (type) {
        case 'Ngân hàng':
          chiTieu = '1,2,8,11,13,10'
          top = 48
          break;
        case 'Bảo hiểm':
          chiTieu = '7,18,15,31,35,8'
          top = 48
          break
        case 'Dịch vụ tài chính':
          chiTieu = '112,214,305,405,9,11'
          top = 48
          break
        default:
          chiTieu = '3,15,5,19'
          top = 32
          break;
      }
      const sort = `case ${chiTieu.split(',').map((item, index) => `when id = ${+item} then ${index}`).join(' ')} end as row_num`
      return { chiTieu, top, sort }
    }
    switch (type) {
      case 'Ngân hàng':
        chiTieu = '1,101,102,2,201,202,3,4,5,6,601,602,7,8,9,10,11,12,1201,1202,13,14,15'
        top = 184
        break;
      case 'Bảo hiểm':
        chiTieu = '1,2,3,4,5,7,8,9,305,11,13,14,15,16,17,18,20,21,22,23,24,25,28,29,31,33,34,35,36,37'
        top = 240
      case 'Dịch vụ tài chính':
        chiTieu = '1,101,102,103,104,106,108,110,111,112,2,201,206,207,209,211,212,214,3,301,302,304,4,401,402,404,405,6,7,9,901,902,10,1001,1002,11,1101'
        top = 296
        break
      default:
        chiTieu = '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21'
        top = 168
        break;
    }
    const sort = `case ${chiTieu.split(',').map((item, index) => `when id = ${+item} then ${index}`).join(' ')} end as row_num`
    return { chiTieu, top, sort }
  }

  async businessResultDetail(stock: string, order: number, is_chart: number) {
    const LV2 = await this.mssqlService.query(`select top 1 LV2 from marketInfor.dbo.info where code = '${stock}'`)
    if (!LV2[0]) return []

    const redisData = await this.redis.get(`${RedisKeys.businessResultDetail}:${order}:${stock}:${is_chart}`)
    if (redisData) return redisData

    const { chiTieu, top, sort } = this.getChiTieuKQKD(LV2[0].LV2, is_chart)

    let select = ``, group = ``
    switch (order) {
      case TimeTypeEnum.Quarter:
        select = `value, case when LEAD(value, 1) OVER (PARTITION BY name ORDER BY yearQuarter DESC) <> 0 then ((value - LEAD(value, 1) OVER (PARTITION BY name ORDER BY yearQuarter DESC)) / LEAD(value, 1) OVER (PARTITION BY name ORDER BY yearQuarter DESC)) * 100 else 0 end AS per, yearQuarter AS date,`
        group = `order by yearQuarter desc`
        break;
      case TimeTypeEnum.Year:
        select = `sum(value) as value, case when (lead(sum(value), 1) over ( partition by name order by year desc)) <> 0 then ((sum(value) - lead(sum(value), 1) over ( partition by name order by year desc)) / (lead(sum(value), 1) over ( partition by name order by year desc))) * 100 else 0 end as per, year as date,`
        group = `group by year, name, id order by year desc`
        break
      default:
        break;
    }
    const query = `
    WITH temp
    AS (SELECT TOP ${top}
      ${select}
      CASE
      WHEN CHARINDEX('- ', name) <> 0 then LTRIM(RIGHT(name, LEN(name) - CHARINDEX('-', name)))
      WHEN CHARINDEX('(', name) = 0 AND
        CHARINDEX('.', name) = 0 THEN name
      WHEN CHARINDEX('(', name) = 0 AND
        CHARINDEX('.', name) <> 0 THEN LTRIM(RIGHT(name, LEN(name) - CHARINDEX('.', name)))
      WHEN CHARINDEX('(', name) <> 0 AND
        CHARINDEX('.', name) = 0 THEN LTRIM(LEFT(name, CHARINDEX('(', name) - 2))
      ELSE LTRIM(LEFT(RIGHT(name, LEN(name) - CHARINDEX(' ', name)),
        CHARINDEX('(', RIGHT(name, LEN(name) - CHARINDEX(' ', name))) - 2))
      END AS name,
      ${sort}
    FROM financialReport.dbo.financialReportV2
    WHERE code = '${stock}'
    AND type = 'KQKD'
    AND id IN (${chiTieu})
    AND RIGHT(yearQuarter, 1) <> 0
    ${group})
    SELECT
      *
    FROM temp
    ORDER BY date ASC, row_num ASC
    `
    const data = await this.mssqlService.query<BusinessResultDetailResponse[]>(query)
    const dataMapped = BusinessResultDetailResponse.mapToList(data, is_chart, LV2[0].LV2)
    await this.redis.set(`${RedisKeys.businessResultDetail}:${order}:${stock}:${is_chart}`, dataMapped, { ttl: TimeToLive.OneWeek })
    return dataMapped
  }

  private getChiTieuCDKT(type: string, is_chart: number) {
    let chiTieu = '', top = 0
    if (is_chart) {
      switch (type) {
        case 'Ngân hàng':
          chiTieu = '102,108,2,302,303,308'
          top = 48
          break;
        case 'Bảo hiểm':
          chiTieu = '10101,10104,2,301,302,303'
          top = 48
          break;
        case 'Dịch vụ tài chính':
          chiTieu = '10101,10201,3,4'
          top = 32
          break;
        default:
          chiTieu = '102,101,301,302'
          top = 32
          break;
      }
      const sort = `case ${chiTieu.split(',').map((item, index) => `when id = ${+item} then ${index}`).join(' ')} end as row_num`
      return { chiTieu, top, sort }
    }
    switch (type) {
      case 'Ngân hàng':
        chiTieu = '1,101,102,104,105,106,108,109,110,111,112,2,301,302,303,304,305,306,307,308,309,4'
        top = 176
        break;
      case 'Bảo hiểm':
        chiTieu = '101,10101,10102,10103,10104,10105,102,10201,10202,10203,10204,10205,10206,2,301,30101,30102,30103,30104,302,30201,30202,303,304'
        top = 192
        break
      case 'Dịch vụ tài chính':
        chiTieu = '1,10101,10102,10201,10202,10205,2,3,30101,30103,30106,30109,30110,30111,30113,30117,302,30204,4,40101,40107,5'
        top = 176
        break
      default:
        chiTieu = '101,10101,10102,10103,10104,10105,102,10201,10202,10203,10204,10205,10206,10207,2,301,30101,30102,302,30201,30202,4'
        top = 176
        break;
    }
    const sort = `case ${chiTieu.split(',').map((item, index) => `when id = ${+item} then ${index}`).join(' ')} end as row_num`
    return { chiTieu, top, sort }
  }

  async balanceSheetDetail(stock: string, order: number, is_chart: number) {
    const LV2 = await this.mssqlService.query(`select top 1 LV2 from marketInfor.dbo.info where code = '${stock}'`)
    if (!LV2[0]) return []

    const redisData = await this.redis.get(`${RedisKeys.balanceSheetDetail}:${order}:${stock}:${is_chart}`)
    if (redisData) return redisData

    const { chiTieu, top, sort } = this.getChiTieuCDKT(LV2[0].LV2, is_chart)

    let select = ``, group = ``
    switch (order) {
      case TimeTypeEnum.Quarter:
        select = `value, yearQuarter AS date,`
        group = `order by yearQuarter desc`
        break;
      case TimeTypeEnum.Year:
        select = `sum(value) as value, year as date,`
        group = `group by year, name, id order by year desc`
        break
      default:
        break;
    }
    let query = `
    WITH temp
    AS (SELECT TOP ${top}
      ${select}
      CASE
      WHEN CHARINDEX('- ', name) <> 0 then LTRIM(RIGHT(name, LEN(name) - CHARINDEX('-', name)))
      WHEN CHARINDEX('(', name) = 0 AND
        CHARINDEX('.', name) = 0 THEN name
      WHEN CHARINDEX('(', name) = 0 AND
        CHARINDEX('.', name) <> 0 THEN LTRIM(RIGHT(name, LEN(name) - CHARINDEX('.', name)))
      WHEN CHARINDEX('(', name) <> 0 AND
        CHARINDEX('.', name) = 0 THEN LTRIM(LEFT(name, CHARINDEX('(', name) - 2))
      ELSE LTRIM(LEFT(RIGHT(name, LEN(name) - CHARINDEX(' ', name)),
        CHARINDEX('(', RIGHT(name, LEN(name) - CHARINDEX(' ', name))) - 2))
      END AS name,
      ${sort}
    FROM financialReport.dbo.financialReportV2
    WHERE code = '${stock}'
    AND type = 'CDKT'
    AND id IN (${chiTieu})
    AND RIGHT(yearQuarter, 1) <> 0
    ${group})
    SELECT
      *
    FROM temp
    ORDER BY date ASC, row_num ASC
    `

    const data = await this.mssqlService.query<BalanceSheetDetailResponse[]>(query)
    const dataMapped = BalanceSheetDetailResponse.mapToList(data, is_chart, LV2[0].LV2)
    await this.redis.set(`${RedisKeys.balanceSheetDetail}:${order}:${stock}:${is_chart}`, dataMapped, { ttl: TimeToLive.OneWeek })
    return dataMapped
  }

  async balanceSheetDetailCircle(stock: string, order: number) {
    const LV2 = await this.mssqlService.query(`select top 1 LV2 from marketInfor.dbo.info where code = '${stock}'`)
    if (!LV2[0]?.LV2) return []

    const redisData = await this.redis.get(`${RedisKeys.balanceSheetDetailCircle}:${order}:${stock}`)
    if (redisData) return redisData

    let select = ``, group = ``, query = ``
    switch (order) {
      case TimeTypeEnum.Quarter:
        select = `value, yearQuarter as date, id`
        group = `order by yearQuarter desc`
        break;
      case TimeTypeEnum.Year:
        select = `sum(value) as value, year as date, id`
        group = `group by year, id order by year desc`
      default:
        break;
    }
    if (LV2[0]?.LV2 == 'Dịch vụ tài chính') {
      query = `
      with temp as (select top 6 ${select}
        from financialReport.dbo.financialReportV2
          where code = '${stock}'
          and id IN (10101, 10201, 3, 4, 2, 5)
          and type = 'CDKT'
          AND RIGHT(yearQuarter, 1) <> 0
          ${group}
          ),
        ngan_han as (
            select 'ngan han' as name, [10101] / [2] * 100 as value, date from temp as source pivot ( sum(value) for id in([10101], [2])) as chuyen
        ),
        dai_han as (
            select 'dai han' as name, [10201] / [2] * 100 as value, date from temp as source pivot ( sum(value) for id in([10201], [2])) as chuyen
        ),
            no_phai_tra as (
            select 'no phai tra' as name, [3] / [5] * 100 as value, date from temp as source pivot ( sum(value) for id in([3], [5])) as chuyen
        ),
            von_so_huu as (
            select 'von chu so huu' as name, [4] / [5] * 100 as value, date from temp as source pivot ( sum(value) for id in([4], [5])) as chuyen
        )
        select * from ngan_han
        union all
        select * from dai_han
        union all
        select * from no_phai_tra
        union all
        select * from von_so_huu
      `

    } else {
      query = `
      with temp as (select top 3 ${select}
              from financialReport.dbo.financialReportV2
                where code = '${stock}'
                and id IN (301, 302, 4)
                and type = 'CDKT'
                AND RIGHT(yearQuarter, 1) <> 0
              ${group}),
     no_phai_tra as (select 'no phai tra' as name, [301] / [4] * 100 as value, date
                     from temp as source pivot ( sum(value) for id in ([301], [4])) as chuyen),
     von_so_huu as (select 'von chu so huu' as name, [302] / [4] * 100 as value, date
                    from temp as source pivot ( sum(value) for id in ([302], [4])) as chuyen),
     tong_von as (select 'tong nguon von' as name, value, date
                  from temp
                  where id = 4)
      select *
      from no_phai_tra
      union all
      select *
      from von_so_huu
      union all
      select *
      from tong_von
      `
    }

    const data = await this.mssqlService.query<BalanceSheetDetailCircleResponse[]>(query)
    const dataMapped = BalanceSheetDetailCircleResponse.mapToList(data)
    await this.redis.set(`${RedisKeys.balanceSheetDetailCircle}:${order}:${stock}`, dataMapped, { ttl: TimeToLive.OneWeek })
    return dataMapped
  }

  private getChiTieuCSTC(industry: string, stock: string): string {
    if (industry == 'Ngân hàng') {
      return [
        { name: 'Chi so danh gia', value: 0 },
        { name: 'P/E', value: 'PE' },
        { name: 'P/B', value: 'PB' },
        { name: 'EPS', value: 'EPS' },
        { name: 'BVPS', value: 'BVPS' },
        { name: 'Hieu qua hoat dong', value: 0 },
        { name: 'ROE', value: 'ROE' },
        { name: 'ROA', value: 'ROA' },
        { name: 'NIM', value: 'NIM' },
        { name: 'YOEA', value: 'YOEA' },
        { name: 'Co cau tai san', value: 0 },
        { name: 'LAR_EAA', value: 'LAR_EAA' },
        { name: 'LAR_TR', value: 'LAR_TR' },
        { name: 'DDA_EAA', value: 'DDA_EAA' },
        { name: 'LDR', value: 'LDR' },
        { name: 'Thanh khoan', value: 0 },
        { name: 'LFR', value: 'LFR' },
        { name: 'LTR', value: 'LTR' },
        { name: 'CAR', value: 'CAR' },
        { name: 'LAR_AR', value: 'LAR_AR' },
        { name: 'Chat luong tin dung', value: 0 },
        { name: 'NPLR', value: 'NPLR' },
        { name: 'NDR', value: 'NDR' },
        { name: 'LLP_NPL', value: 'LLP_NPL' },
        { name: 'NPL_TR', value: 'NPL_TR' },
      ].map((item, index) => `
      select '${item.name}' as name, ${item.value} as value, cast(year as varchar) + cast(quarter as varchar) as date, ${index} as row from financialReport.dbo.calBCTCNH where code = '${stock}'
      `).join(`union all`)
    } else {
      return [
        { name: 'Chi so danh gia', value: 0 },
        { name: 'P/E', value: 'PE' },
        { name: 'P/B', value: 'PB' },
        { name: 'EPS', value: 'EPS' },
        { name: 'BVPS', value: 'BVPS' },
        { name: 'Hieu qua hoat dong', value: 0 },
        { name: 'Vong quay tai san co dinh', value: 'FAT' },
        { name: 'Vong quay tong tai san', value: 'ATR' },
        { name: 'Vong quay tien', value: 'CTR' },
        { name: 'Vong quay VCSH', value: 'CT' },
        { name: 'Kha nang thanh toan', value: 0 },
        { name: 'Chi so kha nang tra no', value: 'DSCR' },
        { name: 'Ty le no hien tai/Tong tai san', value: 'totalDebtToTotalAssets' },
        { name: 'Ty le no hien tai/VCSH', value: 'DE' },
        { name: 'Ty le dam bao tra no bang tai san', value: 'ACR' },
        { name: 'Thanh khoan', value: 0 },
        { name: 'Ty so thanh toan hien hanh', value: 'currentRatio' },
        { name: 'Ty so thanh nhanh', value: 'quickRatio' },
        { name: 'Ty so thanh toan tien mat', value: 'cashRatio' },
        { name: 'Kha nang thanh toan lai vay', value: 'interestCoverageRatio' },
        { name: 'Kha nang sinh loi', value: 0 },
        { name: 'Ty suat loi nhuan gop bien', value: 'GPM' },
        { name: 'Ty suat loi nhuan rong', value: 'NPM' },
        { name: 'ROE', value: 'ROE' },
        { name: 'ROA', value: 'ROA' },
      ].map((item, index) => `
      select '${item.name}' as name, ${item.value} as value, yearQuarter as date, ${index} as row from financialReport.dbo.calBCTC where code = '${stock}' and RIGHT(yearQuarter, 1) <> 0
      `).join(`union all`)
    }
  }

  async financialIndicatorsDetail(stock: string, order: number, is_chart: number) {
    const LV2 = await this.mssqlService.query(`select top 1 LV2 from marketInfor.dbo.info where code = '${stock}'`)
    if (!LV2[0]?.LV2) return []

    const redisData = await this.redis.get(`${RedisKeys.financialIndicatorsDetail}:${order}:${stock}:${is_chart}`)
    if (redisData) return redisData

    const temp = this.getChiTieuCSTC(LV2[0]?.LV2, stock);
    if (!temp) return []

    let select = ``

    switch (order) {
      case TimeTypeEnum.Quarter:
        select = `select top 200 * from temp order by date desc`
        break;
      case TimeTypeEnum.Year:
        select = `select top 200 name, sum(value) as value, LEFT(date, 4) as date, sum(row) as row from temp group by LEFT(date, 4), name order by LEFT(date, 4) desc`
        break
      default:
        break;
    }

    const query = `
    with temp as (${temp}),
    date as (${select})
    select * from date order by date asc, row asc
    `

    const data: any[] = await this.mssqlService.query<FinancialIndicatorsDetailResponse[]>(query)
    const dataMapped = FinancialIndicatorsDetailResponse.mapToList(data, is_chart)
    await this.redis.set(`${RedisKeys.financialIndicatorsDetail}:${order}:${stock}:${is_chart}`, dataMapped, { ttl: TimeToLive.OneDay })
    return dataMapped
  }

  async financialHealthRating(stock: string) {
    const redisData = await this.redis.get(`${RedisKeys.financialHealthRating}:${stock}`)
    if(redisData) return redisData

    const query = `
    WITH stock
    AS (SELECT TOP 1
      currentRatio,
      quickRatio,
      cashRatio,
      interestCoverageRatio,
      ACR,
      DSCR,
      totalDebtToTotalAssets,
      DE,
      FAT,
      ATR,
      CTR,
      CT,
      GPM,
      NPM,
      ROA,
      ROE,
      code
    FROM financialReport.dbo.calBCTC
    WHERE code = '${stock}'
    ORDER BY yearQuarter DESC),
    nganh
    AS (SELECT TOP 1
      currentRatio AS currentRatioIndustry,
      quickRatio AS quickRatioIndustry,
      cashRatio AS cashRatioIndustry,
      interestCoverageRatio AS interestCoverageRatioIndustry,
      ACR AS ACRIndustry,
      DSCR AS DSCRIndustry,
      totalDebtToTotalAssets AS totalDebtToTotalAssetsIndustry,
      DE AS DEIndustry,
      FAT AS FATIndustry,
      ATR AS ATRIndustry,
      CTR AS CTRIndustry,
      CT AS CTIndustry,
      GPM AS GPMIndustry,
      NPM AS NPMIndustry,
      ROA AS ROAIndustry,
      ROE AS ROEIndustry,
      '${stock}' AS code
    FROM VISUALIZED_DATA.dbo.rating
    WHERE LV2 = (SELECT
      LV2
    FROM marketInfor.dbo.info
    WHERE code = '${stock}')
    ORDER BY yearQuarter DESC),
    thi_truong
    AS (SELECT TOP 1
      currentRatio AS currentRatioAll,
      quickRatio AS quickRatioAll,
      cashRatio AS cashRatioAll,
      interestCoverageRatio AS interestCoverageRatioAll,
      ACR AS ACRAll,
      DSCR AS DSCRAll,
      totalDebtToTotalAssets AS totalDebtToTotalAssetsAll,
      DE AS DEAll,
      FAT AS FATAll,
      ATR AS ATRAll,
      CTR AS CTRAll,
      CT AS CTAll,
      GPM AS GPMAll,
      NPM AS NPMAll,
      ROA AS ROAAll,
      ROE AS ROEAll,
      '${stock}' AS code
    FROM VISUALIZED_DATA.dbo.rating
    WHERE LV2 = 'ALL'
    ORDER BY yearQuarter DESC)
    SELECT
      currentRatio,
      quickRatio,
      cashRatio,
      interestCoverageRatio,
      ACR,
      DSCR,
      totalDebtToTotalAssets,
      DE,
      FAT,
      ATR,
      CTR,
      CT,
      GPM,
      NPM,
      ROA,
      ROE,
      currentRatioIndustry,
      quickRatioIndustry,
      cashRatioIndustry,
      interestCoverageRatioIndustry,
      ACRIndustry,
      DSCRIndustry,
      totalDebtToTotalAssetsIndustry,
      DEIndustry,
      FATIndustry,
      ATRIndustry,
      CTRIndustry,
      CTIndustry,
      GPMIndustry,
      NPMIndustry,
      ROAIndustry,
      ROEIndustry,
      currentRatioAll,
      quickRatioAll,
      cashRatioAll,
      interestCoverageRatioAll,
      ACRAll,
      DSCRAll,
      totalDebtToTotalAssetsAll,
      DEAll,
      FATAll,
      ATRAll,
      CTRAll,
      CTAll,
      GPMAll,
      NPMAll,
      ROAAll,
      ROEAll
    FROM stock s
    INNER JOIN nganh n
      ON n.code = s.code
    INNER JOIN thi_truong t
      ON t.code = s.code
    `
    const data = await this.mssqlService.query(query)
    const star: any = this.checkStarFinancialHealthRating(data[0])
    const dataMapped = FinancialHealthRatingResponse.mapToList(star)
    await this.redis.set(`${RedisKeys.financialHealthRating}:${stock}`, dataMapped, { ttl: TimeToLive.OneDay })
    return dataMapped
  }

  async techniqueRating(stock: string) {
    const redisData = await this.redis.get(`${RedisKeys.techniqueRating}:${stock}`)
    if(redisData) return redisData

    const query = `
    SELECT closePrice, highPrice, lowPrice
    FROM marketTrade.dbo.historyTicker
    WHERE code = '${stock}'
    and date >= '2021-01-01'
    order by date
    `
    const data: any = await this.mssqlService.query(query)

    const closePrice = data.map(item => item.closePrice / 1000)
    const highPrice = data.map(item => item.highPrice / 1000)
    const lowPrice = data.map(item => item.lowPrice / 1000)
    const ma5 = this.ma(closePrice, 5)
    const ma10 = this.ma(closePrice, 10)
    const ma20 = this.ma(closePrice, 20)
    const ma50 = this.ma(closePrice, 50)
    const ma100 = this.ma(closePrice, 5)
    const ma200 = this.ma(closePrice, 200)
    const ema5 = this.ema(closePrice, 5)
    const ema10 = this.ema(closePrice, 10)
    const ema20 = this.ema(closePrice, 20)
    const ema50 = this.ema(closePrice, 50)
    const ema100 = this.ema(closePrice, 100)
    const ema200 = this.ema(closePrice, 200)
    const williamR = this.williamR(closePrice, highPrice, lowPrice, 14)
    const {macd, histogram, signal} = this.macD(closePrice)
    const rsi = this.rsi(closePrice, 14)
    const adx = this.adx(closePrice, highPrice, lowPrice, 14)
    const cci = this.cci(closePrice, highPrice, lowPrice, 14)
    const stochRSI = this.stochRSI(closePrice)
    const {dStoch, kStoch} = this.stoch(closePrice, highPrice, lowPrice, 14)

    const dataMapped = TechniqueRatingResponse.mapToList(this.checkStarTechniqueRating(ma5, ma10, ma20, ma50, ma100, ma200, ema5, ema10, ema20, ema50, ema100, ema200, rsi, williamR, macd, histogram, signal, adx, cci, stochRSI, dStoch, kStoch, closePrice[closePrice.length - 1]))
    await this.redis.set(`${RedisKeys.techniqueRating}:${stock}`, dataMapped, { ttl: TimeToLive.OneDay })
    return dataMapped
  }

  async valuationRating(stock: string) {
    const redisData = await this.redis.get(`${RedisKeys.valuationRating}:${stock}`)
    if(redisData) return redisData

    const query = `
    WITH tang_truong
    AS (SELECT TOP 4
      EPS,
      yearQuarter,
      (EPS - LEAD(EPS) OVER (ORDER BY yearQuarter DESC)) / LEAD(EPS) OVER (ORDER BY yearQuarter DESC) * 100 AS tang
    FROM financialReport.dbo.calBCTC
    WHERE RIGHT(yearQuarter, 1) = 0
    AND code = '${stock}'
    ORDER BY yearQuarter DESC),
    LV2 as (SELECT LV2, code
                    FROM marketInfor.dbo.info
                    WHERE code = '${stock}')
    SELECT
      ((r.PE * c.EPS) - (t.closePrice * 1000)) / (t.closePrice * 1000) * 100 AS dinh_gia_pe,
      ((r.PB * c.BVPS) - (t.closePrice * 1000)) / (t.closePrice * 1000) * 100 AS dinh_gia_pb,
      (POWER((22.5 * c.EPS * c.BVPS), 1 / 2) - (t.closePrice * 1000)) / (t.closePrice * 1000) * 100 AS graham_3,
      ((c.EPS * (7 + 1.5 * (SELECT
        AVG(tang) AS binh_quan
      FROM tang_truong)
      ) * 4.4) / (SELECT TOP 1
        laiSuatPhatHanh
      FROM [marketBonds].[dbo].[BondsInfor]
      WHERE kyHan = N'15 Năm'
      AND code = 'VCB'
      ORDER BY ngayPhatHanh DESC)
      - (t.closePrice * 1000)) / (t.closePrice * 1000) * 100 AS graham_2,
      ((c.EPS) * (8.5 + 2 * (SELECT
        AVG(tang) AS binh_quan
      FROM tang_truong)
      ) - (t.closePrice * 1000)) / (t.closePrice * 1000) * 100 AS graham_1
    FROM RATIO.dbo.ratioInday r
    INNER JOIN financialReport.dbo.calBCTC c
      ON c.code = '${stock}'
    INNER JOIN marketTrade.dbo.tickerTradeVND t
      ON t.code = '${stock}'
      inner join LV2 l on l.code = '${stock}'  
    WHERE r.code = l.LV2
    AND r.date = (SELECT
      MAX(date)
    FROM RATIO.dbo.ratioInday where code = l.LV2)
    AND c.yearQuarter = (SELECT
      MAX(yearQuarter)
    FROM financialReport.dbo.calBCTC)
    AND t.date = (SELECT
      MAX(date)
    FROM marketTrade.dbo.tickerTradeVND
    WHERE code = '${stock}')
    `
    
    const data = await this.mssqlService.query<any[]>(query)
    if(data.length == 0) return []

    let tong = 0, index_graham = 0
    const map = Object.keys(data[0]).reduce((acc, current) => {
      const index = acc.findIndex(item => item.name == 'graham')

      if (current.includes('graham') && index == -1) {
        tong += this.checkStarValuationRating(data[0][current])
        return [...acc, { name: 'graham', value: 0, child: [{ name: 'Định giá Graham ' + current.split('_')[1], value: this.checkStarValuationRating(data[0][current]) }] }]
      }
      if (current.includes('graham') && index != -1) {
        index_graham = index
        tong += this.checkStarValuationRating(data[0][current])
        acc[index].child.push({ name: 'Định giá Graham ' + current.split('_')[1], value: this.checkStarValuationRating(data[0][current]) })
        return acc
      }
      return [...acc, { name: current, value: this.checkStarValuationRating(data[0][current]) }]
    }, [])
    map[index_graham].value = UtilCommonTemplate.checkStarCommon(tong, 3)

    const dataMapped = ValuationRatingResponse.mapToList(map)
    await this.redis.set(`${RedisKeys.valuationRating}:${stock}`, dataMapped, { ttl: TimeToLive.HaftHour })
    return dataMapped
  }

  async businessRating(stock: string){
    const redisData = await this.redis.get(`${RedisKeys.businessRating}:${stock}`)
    if(redisData) return redisData

    const query_1 = `
    select
          code,
          tang_truong_doanh_thu,
          tang_truong_loi_nhuan_truoc_thue,
          tang_truong_von_hoa,
          tang_truong_tai_san
    from VISUALIZED_DATA.dbo.rating_nganh_nghe_kinh_doanh
    where yearQuarter = (select max(yearQuarter) from VISUALIZED_DATA.dbo.rating_nganh_nghe_kinh_doanh)
    and LV2 = (select LV2 from marketInfor.dbo.info where code = '${stock}')
    `
    const data_1: any[] = await this.mssqlService.query(query_1)

    const query_2 = `
    select
          kd.code,
          kd.[ty_trong_von_hoa/TTT] as ty_trong_vh,
          kd.[ty_trong_tai_san/TTT] as ty_trong_ts,
          gia.[Tỷ lệ giá trị giao dịch/TTT 1 tháng gần nhất] as gia_1_thang,
                  gia.[Tỷ lệ giá trị giao dịch/TTT 3 tháng gần nhất] as gia_3_thang,
          gia.[Tỷ lệ giá trị giao dịch/TTT 6 tháng gần nhất] as gia_6_thang,
          gia.[Tỷ lệ giá trị giao dịch/TTT 1 năm gần nhất] as gia_1_nam
    from VISUALIZED_DATA.dbo.rating_nganh_nghe_kinh_doanh kd
    inner join VISUALIZED_DATA.dbo.rating_gia gia on gia.code = kd.code
    where kd.yearQuarter = (select max(yearQuarter) from VISUALIZED_DATA.dbo.rating_nganh_nghe_kinh_doanh)
    `
    const data_2: any[] = await this.mssqlService.query(query_2)

    const sortDoanhThu = data_1.map(item => ({value: item.tang_truong_doanh_thu, code: item.code})).sort((a, b) => (a.value < b.value) ? 1 : -1) as [{code: string, value: number}]
    const sortLoiNhuan = data_1.map(item => ({value: item.tang_truong_loi_nhuan_truoc_thue, code: item.code})).sort((a, b) => (a.value < b.value) ? 1 : -1) as [{code: string, value: number}]
    const sortVonHoa = data_1.map(item => ({value: item.tang_truong_von_hoa, code: item.code})).sort((a, b) => (a.value < b.value) ? 1 : -1) as [{code: string, value: number}]
    const sortTaiSan = data_1.map(item => ({value: item.tang_truong_tai_san, code: item.code})).sort((a, b) => (a.value < b.value) ? 1 : -1) as [{code: string, value: number}]

    const sortTyTrongVonHoa: [{code: string, value: number}] = data_2.map(item => ({value: item.ty_trong_vh, code: item.code})).sort((a, b) => (a.value < b.value) ? 1 : -1) as [{code: string, value: number}]
    const sortTyTrongTaiSan = data_2.map(item => ({value: item.ty_trong_ts, code: item.code})).sort((a, b) => (a.value < b.value) ? 1 : -1) as [{code: string, value: number}]
    const sortGia1Thang = data_2.map(item => ({value: item.gia_1_thang, code: item.code})).sort((a, b) => (a.value < b.value) ? 1 : -1) as [{code: string, value: number}]
    const sortGia3Thang = data_2.map(item => ({value: item.gia_3_thang, code: item.code})).sort((a, b) => (a.value < b.value) ? 1 : -1) as [{code: string, value: number}]
    const sortGia6Thang = data_2.map(item => ({value: item.gia_6_thang, code: item.code})).sort((a, b) => (a.value < b.value) ? 1 : -1) as [{code: string, value: number}]
    const sortGia1Nam = data_2.map(item => ({value: item.gia_1_nam, code: item.code})).sort((a, b) => (a.value < b.value) ? 1 : -1) as [{code: string, value: number}]
    
    const dataMapped = BusinessRatingResponse.mapToList(
      this.checkStarBusinessRating(sortDoanhThu, stock), 
      this.checkStarBusinessRating(sortLoiNhuan, stock), 
      this.checkStarBusinessRating(sortVonHoa, stock), 
      this.checkStarBusinessRating(sortTaiSan, stock), 
      this.checkStarBusinessRating(sortTyTrongVonHoa, stock), 
      this.checkStarBusinessRating(sortTyTrongTaiSan, stock), 
      this.checkStarBusinessRating(sortGia1Thang, stock), 
      this.checkStarBusinessRating(sortGia3Thang, stock), 
      this.checkStarBusinessRating(sortGia6Thang, stock), 
      this.checkStarBusinessRating(sortGia1Nam, stock)
      )

    await this.redis.set(`${RedisKeys.businessRating}:${stock}`, dataMapped, { ttl: TimeToLive.OneDay })
      return dataMapped
  }

  async individualInvestorBenefitsRating(stock: string){
    const redisData = await this.redis.get(`${RedisKeys.individualInvestorBenefitsRating}:${stock}`)
    if(redisData) return redisData

    const year = UtilCommonTemplate.getYearQuartersV2(4, TimeTypeEnum.Year)
    
    //Query các ngày hiện tại, 6 tháng, 1 năm, 2 năm, 4 năm
    const date = await this.mssqlService.query(`
    with date_ranges as (
        select
            'HPG' as code,
            max(case when date <= '${moment().format('YYYY-MM-DD')}' then date else null end) as now,
            max(case when date <= '${moment().subtract(6, 'month').format('YYYY-MM-DD')}' then date else null end) as month_6,
            max(case when date <= '${moment().subtract(1, 'year').format('YYYY-MM-DD')}' then date else null end) as year_1,
            max(case when date <= '${moment().subtract(2, 'year').format('YYYY-MM-DD')}' then date else null end) as year_2,
            max(case when date <= '${moment().subtract(4, 'year').format('YYYY-MM-DD')}' then date else null end) as year_4
        from marketTrade.dbo.tickerTradeVND
        where code = 'HPG'
    )
    select code, now, month_6, year_1, year_2, year_4
    from date_ranges;
    `)

    const now = UtilCommonTemplate.toDate(date[0].now)
    const month_6 = UtilCommonTemplate.toDate(date[0].month_6)
    const year_1 = UtilCommonTemplate.toDate(date[0].year_1)
    const year_2 = UtilCommonTemplate.toDate(date[0].year_2)
    const year_4 = UtilCommonTemplate.toDate(date[0].year_4)

    //Query tăng trưởng giá
    const query = `
    SELECT
      ([${now}] - [${month_6}]) / [${month_6}] * 100 AS tt6thang,
      ([${now}] - [${year_1}]) / [${year_1}] * 100 AS tt1nam,
      ([${now}] - [${year_2}]) / [${year_2}] * 100 AS tt2nam,
      ([${now}] - [${year_4}]) / [${year_4}] * 100 AS tt4nam,
      code
    FROM (SELECT
      t.code,
      t.closePrice,
      t.date
    FROM marketTrade.dbo.tickerTradeVND t
    INNER JOIN marketInfor.dbo.info i
      ON i.code = t.code
    WHERE date IN ('${now}', '${month_6}', '${year_1}', '${year_2}', '${year_4}')
    AND i.LV2 NOT IN (N'Ngân hàng', N'Dịch vụ tài chính', N'Bảo hiểm')) AS source PIVOT (SUM(closePrice) FOR date IN ([${now}], [${month_6}], [${year_1}], [${year_2}], [${year_4}])) AS chuyen
    `
    const data: any[] = await this.mssqlService.query(query)

    //Query cổ tức tiền mặt ổn định
    const query_2 = `
    SELECT distinct top 4 
      SUBSTRING(NoiDungSuKien, CHARINDEX('20', NoiDungSuKien), 4) AS year
    FROM PHANTICH.dbo.LichSukien
    WHERE LoaiSuKien = N'Trả cổ tức bằng tiền mặt'
    AND ticker = '${stock}'
    ORDER BY year DESC
    `
    const data_2: [{year: string}] = await this.mssqlService.query(query_2)

    //Query tỷ lệ cổ tức tiền mặt tốt
    const query_3 = `
    WITH temp
    AS (SELECT
      c.code,
      c.MARKETCAP,
      c.SHAREOUT,
      l.vnd,
      NoiDungSuKien,
      SUBSTRING(NoiDungSuKien, CHARINDEX('20', NoiDungSuKien), 4) AS year
    FROM financialReport.dbo.calBCTC c
    INNER JOIN marketInfor.dbo.info i
      ON i.code = c.code
    INNER JOIN PHANTICH.dbo.LichSukien l
      ON l.ticker = c.code
    WHERE i.LV2 NOT IN (N'Dịch vụ tài chính', N'Ngân hàng', N'Bảo hiểm')
    AND c.yearQuarter = (SELECT TOP 1
      yearQuarter
    FROM financialReport.dbo.calBCTC
    ORDER BY yearQuarter DESC)
    AND l.LoaiSuKien = N'Trả cổ tức bằng tiền mặt'),
    ty_le_theo_nam
    AS (SELECT
      AVG(SHAREOUT * vnd / MARKETCAP) AS ty_le_theo_nam,
      year,
      code
    FROM temp
    WHERE year IN (${year.map(item => `'${item.substring(0, 4)}'`).join(',')})
    GROUP BY year,
            code)
    SELECT
      SUM(ty_le_theo_nam) / 4 AS ty_le_co_tuc_tien_mat,
      code
    FROM ty_le_theo_nam
    GROUP BY code
    `
    const redisTyLeCoTucTienMat: any[] = await this.redis.get(RedisKeys.tyLeCoTucTienMat)
    const data_3: any[] = redisTyLeCoTucTienMat ? redisTyLeCoTucTienMat : await this.mssqlService.query(query_3) 
    if(!redisTyLeCoTucTienMat) await this.redis.set(RedisKeys.tyLeCoTucTienMat, data_3, {ttl: TimeToLive.OneWeek})

    //Tính số điểm
    const sort6Thang = data.map(item => ({value: item.tt6thang, code: item.code})).sort((a, b) => (a.value < b.value) ? 1 : -1) as [{code: string, value: number}]
    const sort1Nam = data.map(item => ({value: item.tt1nam, code: item.code})).sort((a, b) => (a.value < b.value) ? 1 : -1) as [{code: string, value: number}]
    const sort2Nam = data.map(item => ({value: item.tt2nam, code: item.code})).sort((a, b) => (a.value < b.value) ? 1 : -1) as [{code: string, value: number}]
    const sort4Nam = data.map(item => ({value: item.tt4nam, code: item.code})).sort((a, b) => (a.value < b.value) ? 1 : -1) as [{code: string, value: number}]
    const sortTyLeCoTuc = data_3.map(item => ({value: item.ty_le_co_tuc_tien_mat, code: item.code})).sort((a, b) => (a.value < b.value) ? 1 : -1) as [{code: string, value: number}]  
    const coTucTienMatOnDinh = this.checkYearConsecutive(data_2.map(item => item.year));

    const dataMapped = IndividualInvestorBenefitsRatingResponse.mapToList(
      this.checkStarBusinessRating(sort6Thang, stock),
      this.checkStarBusinessRating(sort1Nam, stock),
      this.checkStarBusinessRating(sort2Nam, stock),
      this.checkStarBusinessRating(sort4Nam, stock),
      coTucTienMatOnDinh,
      this.checkStarBusinessRating(sortTyLeCoTuc, stock)
    )
    await this.redis.set(`${RedisKeys.individualInvestorBenefitsRating}:${stock}`, dataMapped, { ttl: TimeToLive.OneWeek })
    return dataMapped
  }

  async businessPositionRating(stock: string){
    const redisData = await this.redis.get(`${RedisKeys.businessPositionRating}:${stock}`)
    if(redisData) return redisData

    //query Quy mô doanh nghiệp
    const query = `
    WITH temp
    AS (SELECT
      f.code,
      f.value,
      f.id,
      f.yearQuarter
    FROM financialReport.dbo.financialReportV2 f
    WHERE (f.id = 1
    AND f.type = 'KQKD')
    OR (f.id = 2
    AND f.type = 'CDKT')
    OR (f.id = 15
    AND f.type = 'KQKD')),
    marketcap
    AS (SELECT
      MARKETCAP,
      code
    FROM financialReport.dbo.calBCTC
    WHERE yearQuarter = (SELECT TOP 1
      yearQuarter
    FROM financialReport.dbo.calBCTC
    ORDER BY yearQuarter DESC))
    SELECT
      chuyen.code,
      [1] as doanh_thu,
      [2] as tong_tai_san,
      [15] as loi_nhuan_truoc_thue,
      m.MARKETCAP as von_hoa
    FROM (SELECT
      t.code,
      t.value,
      t.id,
      i.LV2
    FROM temp t
    INNER JOIN marketInfor.dbo.info i
      ON i.code = t.code
    WHERE i.LV2 = (SELECT
      LV2
    FROM marketInfor.dbo.info
    WHERE code = '${stock}')
    AND yearQuarter = (SELECT TOP 1
      yearQuarter
    FROM temp
    ORDER BY yearQuarter DESC)) AS source PIVOT (SUM(value) FOR id IN ([1], [2], [15])) AS chuyen
    INNER JOIN marketcap m
      ON m.code = chuyen.code
    `
    const promise = this.mssqlService.query(query)

    //Query Thị trường quan tâm
    const query_4 = `
    select
        [Giá trị giao dich CP 5 phiên] as phien_5,
        [Giá trị giao dich CP 10 phiên] as phien_10,
        [Giá trị giao dich CP 20 phiên] as phien_20,
        [Giá trị giao dich CP 50 phiên] as phien_50,
        code
    from VISUALIZED_DATA.dbo.rating_gia
    `
    const promise_4 = this.mssqlService.query(query_4)  

    //Query Giá trị sở hữu khối ngoại
    const now = UtilCommonTemplate.toDate((await this.mssqlService.query(`select top 1 date from marketTrade.dbo.[foreign] order by date desc`))[0].date)
    const quarter_4 = UtilCommonTemplate.toDate((await this.mssqlService.query(`select top 1 date from marketTrade.dbo.[foreign] where date <= '${moment(now, 'YYYY/MM/DD').subtract(1, 'year').format('YYYY-MM-DD')}'`))[0].date)

    const query_2 = `
    SELECT
      CASE
        WHEN [${quarter_4}] = 0 THEN 0
        ELSE ([${now}] - [${quarter_4}]) / [${quarter_4}] * 100
      END AS value,
      code
    FROM (SELECT
      f.code,
      (f.totalRoom - f.currentRoom) / s.share_out * 100 AS ty_le_so_huu_khoi_ngoai,
      date
    FROM marketTrade.dbo.[foreign] f
    INNER JOIN VISUALIZED_DATA.dbo.share_out s
      ON s.code = f.code
      INNER JOIN marketInfor.dbo.info i 
      ON i.code = f.code
    WHERE f.date IN ('${now}', '${quarter_4}') and i.LV2 not in (N'Dịch vụ tài chính', N'Ngân hàng', N'Bảo hiểm')) AS source
    PIVOT (SUM(ty_le_so_huu_khoi_ngoai) FOR date IN ([${now}], [${quarter_4}])) AS chuyen
    `
    const promise_2 = this.mssqlService.query(query_2)

    //Query Giá trị tăng trưởng VCSH
    const now_quarter = (await this.mssqlService.query(`select top 1 yearQuarter as date from financialReport.dbo.calBCTC order by yearQuarter desc`))[0].date
    const year_1 = moment(now_quarter, 'YYYYQ').subtract(1, 'year').format('YYYYQ')

    const query_3 = `
    SELECT
      ([${now_quarter}] - [${year_1}]) / [${year_1}] * 100 as value,
      code
    FROM (SELECT
      [Vốn chủ sở hữu] AS value,
      c.code,
      c.yearQuarter
    FROM financialReport.dbo.calBCTC c
    INNER JOIN marketInfor.dbo.info i
      ON i.code = c.code
    WHERE yearQuarter IN ('${now_quarter}', '${year_1}')
    AND i.LV2 NOT IN (N'Dịch vụ tài chính', N'Ngân hàng', N'Bảo hiểm')) AS source PIVOT (SUM(value) FOR yearQuarter IN ([${now_quarter}], [${year_1}])) AS chuyen
    `
    const promise_3 = this.mssqlService.query(query_3)

    // Select
    const [data, data_2, data_3, data_4]: any[] = await Promise.all([promise, promise_2, promise_3, promise_4])

    //Tính điểm
    const quy_mo_doanh_thu = data.map(item => ({value: item.doanh_thu, code: item.code})).sort((a, b) => (a.value < b.value) ? 1 : -1) as [{code: string, value: number}]
    const quy_mo_von_hoa = data.map(item => ({value: item.von_hoa, code: item.code})).sort((a, b) => (a.value < b.value) ? 1 : -1) as [{code: string, value: number}]
    const quy_mo_tai_san = data.map(item => ({value: item.tong_tai_san, code: item.code})).sort((a, b) => (a.value < b.value) ? 1 : -1) as [{code: string, value: number}]
    const quy_mo_loi_nhuan = data.map(item => ({value: item.loi_nhuan_truoc_thue, code: item.code})).sort((a, b) => (a.value < b.value) ? 1 : -1) as [{code: string, value: number}]
    const gd_5_phien = data_4.map(item => ({value: item.phien_5, code: item.code})).sort((a, b) => (a.value < b.value) ? 1 : -1) as [{code: string, value: number}]
    const gd_10_phien = data_4.map(item => ({value: item.phien_10, code: item.code})).sort((a, b) => (a.value < b.value) ? 1 : -1) as [{code: string, value: number}]
    const gd_20_phien = data_4.map(item => ({value: item.phien_20, code: item.code})).sort((a, b) => (a.value < b.value) ? 1 : -1) as [{code: string, value: number}]
    const gd_50_phien = data_4.map(item => ({value: item.phien_50, code: item.code})).sort((a, b) => (a.value < b.value) ? 1 : -1) as [{code: string, value: number}]
    const gia_tri_so_huu_khoi_ngoai = data_2 as [{code: string, value: number}]
    const gia_tri_tang_truong_VCSH = data_3 as [{code: string, value: number}]

    const dataMapped = BusinessPositionRatingResponse.mapToList(
      this.checkStarBusinessRating(quy_mo_doanh_thu, stock),
      this.checkStarBusinessRating(quy_mo_von_hoa, stock),
      this.checkStarBusinessRating(quy_mo_tai_san, stock),
      this.checkStarBusinessRating(quy_mo_loi_nhuan, stock),
      this.checkStarBusinessRating(gd_5_phien, stock),
      this.checkStarBusinessRating(gd_10_phien, stock),
      this.checkStarBusinessRating(gd_20_phien, stock),
      this.checkStarBusinessRating(gd_50_phien, stock),
      this.checkStarBusinessRating(gia_tri_so_huu_khoi_ngoai, stock),
      this.checkStarBusinessRating(gia_tri_tang_truong_VCSH, stock),
    )
    await this.redis.set(`${RedisKeys.businessPositionRating}:${stock}`, dataMapped, {ttl: TimeToLive.OneDay})  
    return dataMapped
  }

  private checkStarTechniqueRating(ma5: number, ma10: number, ma20: number, ma50: number, ma100: number, ma200: number, ema5: number, ema10: number, ema20: number, ema50: number, ema100: number, ema200: number, rsi: number, williamR: number, macd: number, histogram: number, signal: number, adx: number, cci: number, stochRSI: number, dStoch: number, kStoch: number, price: number){
    let pointTech = 1, pointTrend = 1, starTech = 1, starTrend = 1

    //Điền kiện kĩ thuật
    const plusConditionTech = [
      macd > (signal * 1.1), rsi < 30, kStoch < dStoch && kStoch > 80, stochRSI < 20, histogram > 0, adx > 25, williamR > -20, cci > 100
    ] 
    const subtractConditionTech = [
      (macd * 1.1) < signal, rsi > 70, kStoch > dStoch && kStoch < 20, stochRSI > 80, histogram < 0, adx < 25, williamR < -80, cci < -100
    ]

    //Điều kiện xu hướng
    const plusConditionTrend = [
      price > (ma5 * 1.05), 
      price > (ma10 * 1.05), 
      price > (ma20 * 1.05),
      price > (ma50 * 1.05),
      price > (ma100 * 1.05),
      price > (ma200 * 1.05),
      price > (ema5 * 1.05),
      price > (ema10 * 1.05),
      price > (ema20 * 1.05),
      price > (ema50 * 1.05),
      price > (ema100 * 1.05),
      price > (ema200 * 1.05),
    ]
    const subtractConditionTrend = [
      price < ma5, 
      price < ma10, 
      price < ma20,
      price < ma50,
      price < ma100,
      price < ma200,
      price < ema5,
      price < ema10,
      price < ema20,
      price < ema50,
      price < ema100,
      price < ema200,
    ]

    //Map qua các điều kiện tính số điểm
    plusConditionTech.map(item => {
      if(item)
        pointTech++
    })
    subtractConditionTech.map(item => {
      if(item) pointTech--
    })
    plusConditionTrend.map(item => {
      if(item)
        pointTrend++
    })
    subtractConditionTrend.map(item => {
      if(item) pointTrend--
    })

    //Tính điểm sao chỉ báo kĩ thuật
    if(pointTech == 1 || pointTech == 2) starTech = 1
    if(pointTech == 3 || pointTech == 4) starTech = 2
    if(pointTech == 5) starTech = 3
    if(pointTech == 6 || pointTech == 7) starTech = 4
    if(pointTech == 8) starTech = 5

    //Tính điểm sao xu hướng
    if(pointTrend == 1 || pointTrend == 2) starTrend = 1
    if(pointTrend == 3 || pointTrend == 4) starTrend = 2
    if(pointTrend == 5 || pointTrend == 6 || pointTrend == 7) starTrend = 3
    if(pointTrend == 8 || pointTrend == 9 || pointTrend == 10) starTrend = 4
    if(pointTrend == 11 || pointTrend == 12) starTrend = 5

    return [
      {name: 'Chỉ báo kỹ thuật', value: starTech}, 
      {name: 'Xu hướng', value: starTrend}, 
    ]
  }

  private ema(closePrice: number[], period: number){
    const ema = new calTech.EMA({period, values: closePrice}).result
    return ema[ema.length - 1]
  }

  private rsi(closePrice: number[], period: number){
    const rsi = new calTech.RSI({period, values: closePrice}).result
    return rsi[rsi.length - 1]
  }

  private williamR(closePrice: number[], highPrice: number[], lowPrice: number[], period: number){
    const williamR = new calTech.WilliamsR({close: closePrice, high: highPrice, low: lowPrice, period}).result
    return williamR[williamR.length - 1]
  }

  private macD(closePrice: number[]){
    const macD = new calTech.MACD({values: closePrice, SimpleMAOscillator: false, SimpleMASignal: false, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9}).result
    return {macd: macD[macD.length - 1].MACD, histogram: macD[macD.length - 1].histogram, signal: macD[macD.length - 1].signal}
  }

  private adx(closePrice: number[], highPrice: number[], lowPrice: number[], period: number){
    const adx = new calTech.ADX({close: closePrice, high: highPrice, low: lowPrice, period}).result
    return adx[adx.length - 1].adx
  }

  private cci(closePrice: number[], highPrice: number[], lowPrice: number[], period: number){
    const cci = new calTech.CCI({close: closePrice, high: highPrice, low: lowPrice, period}).result
    return cci[cci.length - 1]
  }

  private stochRSI(closePrice: number[]){
    const stochRSI = new calTech.StochasticRSI({rsiPeriod: 14, kPeriod: 3, dPeriod: 3, values: closePrice, stochasticPeriod: 14}).result
    return stochRSI[stochRSI.length - 1].stochRSI
  }

  private stoch(closePrice: number[], highPrice: number[], lowPrice: number[], period: number){
    const stoch = new calTech.Stochastic({close: closePrice, high: highPrice, low: lowPrice, period: period, signalPeriod: 3}).result
    return {dStoch: stoch[stoch.length - 1].d, kStoch: stoch[stoch.length - 1].k}
  }

  private ma(closePrice: number[], period: number){
    const ma = new calTech.SMA({period, values: closePrice}).result
    return ma[ma.length - 1]
  }

  private checkStarValuationRating(value: number) {
    if (value > 20) return 5
    if (value < 20 && value >= 10) return 4
    if (value < 10 && value > -10) return 3
    if (value <= -10 && value >= -20) return 2
    if (value < -20) return 1
  }

  private checkStarBusinessRating(arr: [{code: string, value: number}], stock: string){
    const length = arr.length
    const indx = arr.findIndex(item => item.code == stock)

    const per = indx / length * 100

    if(per > 80) return 1
    if(per <= 80 && per > 60) return 2
    if(per <= 60 && per > 40) return 3
    if(per <= 40 && per > 20) return 4
    return 5
  }

  private checkYearConsecutive(years: string[]) {
    let consecutiveCount = 1;
    for (let i = 0; i < years.length - 1; i++) {
      const currentYear = parseInt(years[i]);
      const nextYear = parseInt(years[i + 1]);

      if (currentYear - nextYear === 1) {
        consecutiveCount++;
      }
    }
    if(consecutiveCount == 4) return 5 
    if(consecutiveCount == 3) return 4 
    if(consecutiveCount == 2) return 3 
    if(consecutiveCount == 3) return 2 
    if(consecutiveCount == 1) return 1 
  }

  private checkStarFinancialHealthRating(obj: any){
    const data = Object.entries(obj).reduce((result: any, [key, value]) => {
      if(key.includes('All')){
          if(!result?.all) result.all = {}
          result.all[key.replace('All', '')] = value
          return result
      }
      if(key.includes('Industry')){
          if(!result?.industry) result.industry = {}
          result.industry[key.replace('Industry', '')] = value
          return result
      }
      if(!result?.stock) result.stock = {}
          result.stock[key] = value
          return result
    }, {});
    
  const properties = Object.keys(data.stock);
  
  let star = {}
  
  for (let property of properties) {
    const stockValue = data.stock[property];
    const industryValue = data.industry[property];
    const allValue = data.all[property];
  
    if(stockValue > industryValue > allValue) star[property] = 5
    else if(stockValue > allValue > industryValue) star[property] = 4
    else if(industryValue > stockValue > allValue) star[property] = 3
    else if(allValue > stockValue > industryValue) star[property] = 2
    else star[property] = 1
  }
  
  return star
  }
}

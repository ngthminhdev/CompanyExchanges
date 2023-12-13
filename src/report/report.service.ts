import { CACHE_MANAGER, Catch, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as moment from 'moment';
import { TimeToLive } from '../enums/common.enum';
import { RedisKeys } from '../enums/redis-keys.enum';
import { CatchException, ExceptionResponse } from '../exceptions/common.exception';
import { MinioOptionService } from '../minio/minio.service';
import { MssqlService } from '../mssql/mssql.service';
import { UtilCommonTemplate } from '../utils/utils.common';
import { INews } from './dto/save-news.dto';
import { EventResponse } from './response/event.response';
import { ExchangeRateResponse } from './response/exchangeRate.response';
import { ReportIndexResponse } from './response/index.response';
import { MerchandiseResponse } from './response/merchandise.response';
import { MorningResponse } from './response/morning.response';
import { ITop, MorningHoseResponse } from './response/morningHose.response';
import { NewsEnterpriseResponse } from './response/newsEnterprise.response';
import { NewsInternationalResponse } from './response/newsInternational.response';
import { StockMarketResponse } from './response/stockMarket.response';
import { TopScoreResponse } from './response/topScore.response';

@Injectable()
export class ReportService {
  constructor(
    private readonly mssqlService: MssqlService,
    @Inject(CACHE_MANAGER)
    private readonly redis: Cache,
    private readonly minio: MinioOptionService
  ) { }
  async getIndex() {
    const redisData = await this.redis.get(RedisKeys.reportIndex)
    if (redisData) return redisData

    const now = moment().format('YYYY-MM-DD')
    const week = moment().subtract(7, 'day').format('YYYY-MM-DD')

    const date = moment((await this.mssqlService.query(`select top 1 date from marketTrade.dbo.indexTradeVND where date <= '${moment().subtract(1, 'day').format('YYYY-MM-DD')}'`))[0].date).format('YYYY-MM-DD')
    const month = moment((await this.mssqlService.query(`select top 1 date from marketTrade.dbo.indexTradeVND where date <= '${moment().subtract(1, 'month').format('YYYY-MM-DD')}'`))[0].date).format('YYYY-MM-DD')
    const year = moment((await this.mssqlService.query(`select top 1 date from marketTrade.dbo.indexTradeVND where date >= '${moment().month(0).date(1).format('YYYY-MM-DD')}' order by date asc`))[0].date).format('YYYY-MM-DD')

    const query = `
      WITH temp
      AS (SELECT
        code,
        closePrice,
        date
      FROM marketTrade.dbo.indexTradeVND
      WHERE code IN ('VNINDEX', 'HNX', 'UPCOM', 'VN30', 'HNX30')
      AND date IN ('${now}', '${date}', '${week}', '${month}', '${year}')),
      pivotted
      AS (SELECT
        code,
        [${now}] AS now,
        [${date}] AS date,
        [${week}] AS week,
        [${month}] AS month,
        [${year}] AS year
      FROM (SELECT
        *
      FROM temp) AS source PIVOT (SUM(closePrice) FOR date IN ([${now}], [${date}], [${week}], [${month}], [${year}])) AS chuyen),
      gtnn
      AS (SELECT
        code,
        buyVal AS buy,
        sellVal AS sell,
        netVal AS net
      FROM marketTrade.dbo.[foreign]
      WHERE code IN ('VNINDEX', 'HNX', 'UPCOM', 'VN30', 'HNX30')
      AND date = '${now}')
      SELECT
        pivotted.code,
        ((now - date) / date) * 100 AS d_value,
        ((now - week) / week) * 100 AS w_value,
        ((now - month) / month) * 100 AS m_value,
        ((now - year) / year) * 100 AS y_value,
        buy,
        sell,
        net
      FROM pivotted
      LEFT JOIN gtnn
        ON gtnn.code = pivotted.code
    `
    const data = await this.mssqlService.query<ReportIndexResponse[]>(query)
    const dataMapped = ReportIndexResponse.mapToList(data)
    await this.redis.set(RedisKeys.reportIndex, dataMapped, { ttl: TimeToLive.HaftMinute })
    return dataMapped
  }

  async uploadFile(file: any[]) {
    for (const item of file) {
      await this.minio.put(`resources`, `stock/${item.originalname}`, item.buffer, {
        'Content-Type': item.mimetype,
        'X-Amz-Meta-Testing': 1234,
      })
    }
    return 'success'
  }

  async uploadFileReport(file: any[]) {
    const now = moment().format('DD-MM-YYYY')

    for (const item of file) {
      await this.minio.put(`report`, `${now}/${UtilCommonTemplate.removeVietnameseString(item.originalname)}`, item.buffer, {
        'Content-Type': item.mimetype,
        'X-Amz-Meta-Testing': 1234,
      })
    }
    return
  }

  async newsInternational(quantity: number) {
    try {
      const data = await this.mssqlService.query<NewsInternationalResponse[]>(`
      select distinct top ${quantity || 7} Title as title, Href as href, Date from macroEconomic.dbo.TinTucQuocTe order by Date desc
      `)
      const dataMapped = NewsInternationalResponse.mapToList(data)
      return dataMapped
    } catch (e) {
      throw new CatchException(e)
    }
  }

  async newsDomestic(quantity: number) {
    try {
      const data = await this.mssqlService.query<NewsInternationalResponse[]>(`
      select distinct top ${quantity || 6} Title as title, Href as href, Date from macroEconomic.dbo.TinTucViMo order by Date desc
      `)
      const dataMapped = NewsInternationalResponse.mapToList(data)
      return dataMapped
    } catch (e) {
      throw new CatchException(e)
    }
  }

  async newsEnterprise(quantity: number) {
    try {
      const data = await this.mssqlService.query<NewsEnterpriseResponse[]>(`
      select distinct top ${quantity || 9} TickerTitle as ticker, Title as title, Href as href, Date from macroEconomic.dbo.TinTuc where TickerTitle != '' order by Date desc
      `)
      const dataMapped = NewsEnterpriseResponse.mapToList(data)
      return dataMapped
    } catch (e) {
      throw new CatchException(e)
    }
  }

  async event() {
    try {
      const data = await this.mssqlService.query<NewsEnterpriseResponse[]>(`select distinct top 15 ticker, NoiDungSuKien as title, NgayDKCC as date from PHANTICH.dbo.LichSukien order by NgayDKCC desc`)
      const dataMapped = EventResponse.mapToList(data)
      return dataMapped
    } catch (e) {
      throw new CatchException(e)
    }
  }

  async exchangeRate() {
    try {
      const now = moment((await this.mssqlService.query(`select top 1 date from macroEconomic.dbo.exchangeRateVCB order by date desc`))[0].date).format('YYYY-MM-DD')
      const prev = moment(now).subtract(1, 'day').format('YYYY-MM-DD')
      const month = moment(now).subtract(1, 'month').format('YYYY-MM-DD')
      const year = moment(now).startOf('year').format('YYYY-MM-DD')

      const code = `
      'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'SGD', 'CAD', 'HKD'
      `
      const sort = `case ${code.split(',').map((item, index) => `when code = ${item.replace(/\n/g, "").trim()} then ${index}`).join(' ')} end as row_num`

      const query = `
      WITH temp
      AS (SELECT
        date,
        code,
        bySell,
        ${sort}
      FROM macroEconomic.dbo.exchangeRateVCB
      WHERE code IN (${code})
      AND date IN ('${now}', '${prev}', '${year}', '${month}'))
      SELECT
        code,
        [${now}] AS price,
        ([${now}] - [${prev}]) / [${prev}] * 100 AS day,
        ([${now}] - [${month}]) / [${month}] * 100 AS month,
        ([${now}] - [${year}]) / [${year}] * 100 AS year
      FROM temp AS source PIVOT (SUM(bySell) FOR date IN ([${now}], [${prev}], [${year}], [${month}])) AS chuyen
      `

      const data = await this.mssqlService.query<ExchangeRateResponse[]>(query)
      const dataMapped = ExchangeRateResponse.mapToList(data)
      return dataMapped
    } catch (e) {
      throw new CatchException(e)
    }
  }

  async merchandise() {
    try {
      const query = `
      WITH temp
      AS (SELECT
        MAX(lastUpdated) AS date,
        name
      FROM macroEconomic.dbo.HangHoa
      WHERE unit != ''
      GROUP BY name)
      SELECT
        h.name + ' (' + h.unit + ')' AS name,
        price,
        change1D AS day,
        change3M AS month,
        change1Y AS year,
        changeYTD AS ytd,
        CASE
          WHEN h.name = N'Dầu Brent' THEN 1
          WHEN h.name = N'Dầu Thô' THEN 2
          WHEN h.name = N'Vàng' THEN 3
          ELSE 4
        END AS row_num
      FROM macroEconomic.dbo.HangHoa h
      INNER JOIN temp t
        ON t.name = h.name
        AND t.date = h.lastUpdated
      WHERE h.id IS NOT NULL
      ORDER BY row_num ASC, h.name ASC
      `
      const data = await this.mssqlService.query<MerchandiseResponse[]>(query)
      const dataMapped = MerchandiseResponse.mapToList(data)
      return dataMapped
    } catch (e) {
      throw new CatchException(e)
    }
  }

  async interestRate() {
    try {
      const code = `N'Qua đêm', N'1 tuần', N'2 tuần', N'1 tháng', N'3 tháng'`
      const sort = `case ${code.split(',').map((item, index) => `when code = ${item.replace(/\n/g, "").trim()} then ${index}`).join(' ')} end as row_num`
      const now = moment((await this.mssqlService.query(`select top 1 date from macroEconomic.dbo.EconomicVN_byTriVo order by date desc`))[0].date).format('YYYY-MM-DD')
      const date = await this.mssqlService.query(
        `with date_ranges as (
          select
              max(case when date <= '${moment(now).subtract(1, 'day').format('YYYY-MM-DD')}' then date else null end) as prev,
              max(case when date <= '${moment(now).subtract(1, 'month').format('YYYY-MM-DD')}' then date else null end) as month,
              min(case when date >= '${moment(now).startOf('year').format('YYYY-MM-DD')}' then date else null end) as ytd
          from macroEconomic.dbo.EconomicVN_byTriVo
      )
      select prev, month, ytd
      from date_ranges;`
      )
      const prev = moment(date[0].prev).format('YYYY-MM-DD')
      const month = moment(date[0].month).format('YYYY-MM-DD')
      const ytd = moment(date[0].ytd).format('YYYY-MM-DD')

      const query = `
      WITH temp
      AS (SELECT
        date,
        code,
        value,
        ${sort}
      FROM macroEconomic.dbo.EconomicVN_byTriVo
      WHERE date IN ('${now}', '${prev}', '${month}', '${ytd}')
      AND code IN (N'Qua đêm', N'1 tuần', N'2 tuần', N'1 tháng', N'3 tháng'))
      SELECT
        code,
        [${now}] AS price,
        ([${now}] - [${prev}]) / [${prev}] * 100 AS day,
        ([${now}] - [${month}]) / [${month}] * 100 AS month,
        ([${now}] - [${ytd}]) / [${ytd}] * 100 AS year
      FROM temp PIVOT (SUM(value) FOR date IN ([${now}], [${prev}], [${month}], [${ytd}])) AS chuyen
      `
      const data = await this.mssqlService.query<ExchangeRateResponse[]>(query)
      const dataMapped = ExchangeRateResponse.mapToList(data)
      return dataMapped
    } catch (e) {
      throw new CatchException(e)
    }
  }

  async stockMarket() {
    try {
      const name = `
      'Dow Jones', 'Nikkei 225', 'Shanghai', 'FTSE 100'
      `
      const index = `
      'VNINDEX', 'VN30', 'HNX', 'UPCOM'
      `
      const sort = `case ${name.split(',').map((item, index) => `when t.name = ${item.replace(/\n/g, "").trim()} then ${index + 4}`).join(' ')} end as row_num`
      const sort_1 = `case ${index.split(',').map((item, index) => `when t.code = ${item.replace(/\n/g, "").trim()} then ${index}`).join(' ')} end as row_num`

      const query = `
      WITH temp
      AS (SELECT
        name,
        closePrice,
        date,
        (closePrice - LEAD(closePrice) OVER (PARTITION BY name ORDER BY date DESC)) / LEAD(closePrice) OVER (PARTITION BY name ORDER BY date DESC) * 100 AS prev,
        (closePrice - LEAD(closePrice, 19) OVER (PARTITION BY name ORDER BY date DESC)) / LEAD(closePrice, 19) OVER (PARTITION BY name ORDER BY date DESC) * 100 AS month,
        (closePrice - LEAD(closePrice, 249) OVER (PARTITION BY name ORDER BY date DESC)) / LEAD(closePrice, 249) OVER (PARTITION BY name ORDER BY date DESC) * 100 AS year
      FROM macroEconomic.dbo.WorldIndices
      WHERE name IN ('Dow Jones', 'Nikkei 225', 'Shanghai', 'FTSE 100')),
      max_date
      AS (SELECT
        MAX(date) AS date,
        name
      FROM temp
      GROUP BY name),
      ytd_date
      AS (SELECT
        MIN(date) AS date,
        name
      FROM macroEconomic.dbo.WorldIndices
      WHERE YEAR(date) = YEAR(GETDATE())
      GROUP BY name),
      ytd_price
      AS (SELECT
        t.name,
        t.date,
        t.closePrice
      FROM temp t
      INNER JOIN ytd_date y
        ON t.name = y.name
        AND t.date = y.date),

      temp_1
      AS (SELECT
        code,
        closePrice,
        date,
        (closePrice - LEAD(closePrice) OVER (PARTITION BY code ORDER BY date DESC)) / LEAD(closePrice) OVER (PARTITION BY code ORDER BY date DESC) * 100 AS prev,
        (closePrice - LEAD(closePrice, 19) OVER (PARTITION BY code ORDER BY date DESC)) / LEAD(closePrice, 19) OVER (PARTITION BY code ORDER BY date DESC) * 100 AS month,
        (closePrice - LEAD(closePrice, 249) OVER (PARTITION BY code ORDER BY date DESC)) / LEAD(closePrice, 249) OVER (PARTITION BY code ORDER BY date DESC) * 100 AS year
      FROM marketTrade.dbo.indexTradeVND
      WHERE code IN ('VNINDEX', 'HNX', 'UPCOM', 'VN30')),
      max_date_1
      AS (SELECT
        MAX(date) AS date,
        code
      FROM temp_1
      GROUP BY code),
      ytd_date_1
      AS (SELECT
        MIN(date) AS date,
        code
      FROM marketTrade.dbo.indexTradeVND
      WHERE YEAR(date) = YEAR(GETDATE())
      GROUP BY code),
      ytd_price_1
      AS (SELECT
        t.code,
        t.date,
        t.closePrice
      FROM temp_1 t
      INNER JOIN ytd_date_1 y
        ON t.code = y.code
        AND t.date = y.date)

      SELECT
        t.code,
        t.closePrice AS price,
        t.prev AS day,
        t.month,
        t.year,
        (t.closePrice - y.closePrice) / y.closePrice * 100 AS ytd,
        ${sort_1}
      FROM temp_1 t
      INNER JOIN max_date_1 m
        ON t.date = m.date
        AND t.code = m.code
      INNER JOIN ytd_price_1 y
        ON t.code = y.code

      UNION ALL
      SELECT
        t.name AS code,
        t.closePrice AS price,
        t.prev AS day,
        t.month,
        t.year,
        (t.closePrice - y.closePrice) / y.closePrice * 100 AS ytd,
        ${sort}
      FROM temp t
      INNER JOIN max_date m
        ON t.date = m.date
        AND t.name = m.name
      INNER JOIN ytd_price y
        ON t.name = y.name
      ORDER BY row_num ASC
      `
      const data = await this.mssqlService.query<StockMarketResponse[]>(query)
      const dataMapped = StockMarketResponse.mapToList(data)
      return dataMapped
    } catch (e) {
      throw new CatchException(e)
    }
  }

  async morning() {
    try {
      const index = `'VNINDEX', 'HNX', 'UPCOM', 'VN30'`
      const sort = `case ${index.split(',').map((item, index) => `when code = ${item.replace(/\n/g, "").trim()} then ${index + 4}`).join(' ')} end as row_num`

      const query = `
      SELECT
        code,
        timeInday AS time,
        closePrice as price,
        change,
        perChange,
        ${sort}
      FROM tradeIntraday.dbo.indexTradeVNDIntraday
      WHERE code IN (${index})
      AND date = (SELECT TOP 1
        date
      FROM tradeIntraday.dbo.indexTradeVNDIntraday
      ORDER BY date DESC)
      AND timeInday >= '09:15:00'
      AND timeInday <= '11:33:00'
      ORDER BY row_num ASC, timeInday DESC
      `
      const query_2 = `
      WITH temp
      AS (SELECT
        LEAD(closePrice) OVER (PARTITION BY code ORDER BY date DESC) AS prevClosePrice,
        code,
        date
      FROM marketTrade.dbo.indexTradeVND
      WHERE code IN ('VNINDEX', 'HNX', 'UPCOM', 'VN30'))
      SELECT
        *
      FROM temp
      WHERE date = (SELECT
        MAX(date)
      FROM temp)
      `  

      const [data, data_2] = await Promise.all([this.mssqlService.query<any[]>(query), this.mssqlService.query<any[]>(query_2)]) 
        
      const reduceData = data.reduce((result, cur) => {
        const index = result.findIndex(item => item.code == cur.code)
        if (index == -1) {
          result.push({ code: cur.code, change: cur.change, perChange: cur.perChange, prevClosePrice: (data_2.find(item => item.code == cur.code)).prevClosePrice, chart: [{ time: UtilCommonTemplate.changeDateUTC(cur.time), value: cur.price }] })
        } else {
          result[index].chart.unshift({ time: UtilCommonTemplate.changeDateUTC(cur.time), value: cur.price })
        }
        return result
      }, [])
      const dataMapped = MorningResponse.mapToList(reduceData)
      return dataMapped
    } catch (e) {
      throw new CatchException(e)
    }
  }

  async morningHose() {
    try {
      //Độ rộng vs khối ngoại
      const promise_1 = this.mssqlService.query(`
      WITH breath
      AS (SELECT TOP 1
        noChange,
        decline,
        advance,
        'HOSE' AS code
      FROM WEBSITE_SERVER.dbo.MarketBreadth
      ORDER BY time DESC),
      net
      AS (SELECT TOP 1
        netVal,
        'HOSE' AS code
      FROM marketTrade.dbo.[foreign]
      WHERE code = 'VNINDEX'
      ORDER BY date DESC)
      SELECT
        *
      FROM breath b
      INNER JOIN net n
        ON n.code = b.code
      `)

      //Top mua ròng
      const promise_2 = this.mssqlService.query<ITop[]>(`
      SELECT TOP 4
        code, netVal
      FROM marketTrade.dbo.[foreign]
      WHERE type IN ('STOCK', 'ETF')
      AND date = (SELECT
        MAX(date)
      FROM marketTrade.dbo.[foreign])
      AND floor = 'HOSE'
      AND netVal > 0
      ORDER BY netVal DESC
      `)

      //Top bán ròng
      const promise_3 = this.mssqlService.query<ITop[]>(`
      SELECT TOP 4
        code, netVal
      FROM marketTrade.dbo.[foreign]
      WHERE type IN ('STOCK', 'ETF')
      AND date = (SELECT
        MAX(date)
      FROM marketTrade.dbo.[foreign])
      AND floor = 'HOSE'
      AND netVal < 0
      ORDER BY netVal ASC
      `)

      const [data_1, data_2, data_3] = await Promise.all([promise_1, promise_2, promise_3])

      const dataMapped = new MorningHoseResponse({
        noChange: data_1[0]?.noChange,
        decline: data_1[0]?.decline,
        advance: data_1[0]?.advance,
        netVal: data_1[0]?.netVal,
        sell: data_3,
        buy: data_2
      })
      return dataMapped
    } catch (e) {
      throw new CatchException(e)
    }
  }

  async topScore() {
    try {
      //Top tăng
      const promise_1 = this.mssqlService.query(`
      SELECT TOP 4
        c.symbol AS code,
        c.point
      FROM WEBSITE_SERVER.dbo.CPAH c
      WHERE c.date = (SELECT
        MAX(date)
      FROM WEBSITE_SERVER.dbo.CPAH)
      AND c.floor = 'HSX'
      ORDER BY c.point DESC
      `)
      //Top giảm
      const promise_2 = this.mssqlService.query(`
      SELECT TOP 4
        c.symbol AS code,
        c.point
      FROM WEBSITE_SERVER.dbo.CPAH c
      WHERE c.date = (SELECT
        MAX(date)
      FROM WEBSITE_SERVER.dbo.CPAH)
      AND c.floor = 'HSX'
      ORDER BY c.point ASC
      `)
      const promise_3 = this.mssqlService.query(`
      WITH temp_1
      AS (SELECT TOP 1
        noChange,
        decline,
        advance,
        'VNINDEX' AS code
      FROM WEBSITE_SERVER.dbo.MarketBreadth
      ORDER BY time DESC),
      temp
      AS (SELECT
        code,
        date,
        change,
        perChange,
        totalVal
      FROM marketTrade.dbo.indexTradeVND
      WHERE code = 'VNINDEX')
      SELECT
        *
      FROM temp t
      LEFT JOIN temp_1 t1
        ON t1.code = t.code
      WHERE date = (SELECT
        MAX(date)
      FROM temp)
      `)
      const promise_4 = this.mssqlService.query(`
      WITH date
      AS (SELECT DISTINCT TOP 2
        date
      FROM tradeIntraday.dbo.indexTradeVNDIntraday
      WHERE code = 'VNINDEX'
      ORDER BY date DESC),
      prev
      AS (SELECT TOP 1
        totalVal,
        code
      FROM tradeIntraday.dbo.indexTradeVNDIntraday
      WHERE code = 'VNINDEX'
      AND date = (SELECT TOP 1
        date
      FROM date
      ORDER BY date ASC)
      AND timeInday <= '11:33:00'
      ORDER BY timeInday DESC),
      now
      AS (SELECT TOP 1
        totalVal,
        code
      FROM tradeIntraday.dbo.indexTradeVNDIntraday
      WHERE code = 'VNINDEX'
      AND date = (SELECT TOP 1
        date
      FROM date
      ORDER BY date DESC)
      AND timeInday <= '11:33:00'
      ORDER BY timeInday DESC)
      SELECT
        (n.totalVal - p.totalVal) / p.totalVal * 100 AS perChangeVal
      FROM prev p
      INNER JOIN now n
        ON p.code = n.code
      `)
      const [data_1, data_2, data_3, data_4] = await Promise.all([promise_1, promise_2, promise_3, promise_4])
      return new TopScoreResponse({
        stock_advance: data_1,
        stock_decline: data_2,
        ...data_3[0],
        ...data_4[0]
      })
    } catch (e) {
      throw new CatchException(e)
    }
  }

  async identifyMarket() {
    try {
      const promise_1 = this.mssqlService.query(`
      select Text1 as text_1, Text2 as text_2 from [PHANTICH].[dbo].[morningReport]
      `)

      const promise_2 = this.mssqlService.query(`
      select code, giaKhuyenNghi as gia_khuyen_nghi, giaMucTieu as gia_muc_tieu, giaNgungLo as Gia_ngung_lo, laiSuatSinhLoiKyVong as lai_suat, thoiGianNamGiu as thoi_gian from PHANTICH.dbo.morningReportStock
      `)

      const promise_3 = this.mssqlService.query(`
      select * from PHANTICH.dbo.morningReportStockSell
      `)

      const [data_1, data_2, data_3] = await Promise.all([promise_1, promise_2, promise_3]) as any
      
      return { text: [data_1[0].text_1, data_1[0].text_2], stock: data_2, stock_sell: data_3}
     
    } catch (e) {
      throw new CatchException(e)
    }
  }

  async identifyMarketRedis(){
    try {
      const [data_1, data_2] = await Promise.all([
        this.redis.get(RedisKeys.saveIdentifyMarket), 
        this.redis.get(RedisKeys.saveStockRecommend)
      ])
      return {text: data_1, stock: data_2}
    } catch (e) {
      throw new CatchException(e)
    }
  }

  async saveNews(id: number, value: INews[]) {
    try {
      let name_redis = ''
      switch (+id) {
        case 0:
          name_redis = RedisKeys.morningNewsInternational
          break;
        case 1:
          name_redis = RedisKeys.morningNewsDomestic
          break
        case 2:
          name_redis = RedisKeys.morningNewsEnterprise
          break
        default:
          break;
      }
      await this.redis.set(name_redis, value, {ttl: TimeToLive.OneYear})
    } catch (e) {
      throw new CatchException(e)
    }
  }

  async getNews(id: number){
    try {
      let name_redis = ''
      switch (+id) {
        case 0:
          name_redis = RedisKeys.morningNewsInternational
          break;
        case 1:
          name_redis = RedisKeys.morningNewsDomestic
          break
        case 2:
          name_redis = RedisKeys.morningNewsEnterprise
          break
        default:
          break;
      }
      const data = await this.redis.get(name_redis) || []
      return data
    } catch (error) {
      throw new CatchException(error)
    }
  }

  async saveIdentifyMarket(text: string[]){
    try {
      await this.redis.set(RedisKeys.saveIdentifyMarket, text, {ttl: TimeToLive.OneYear})
    } catch (e) {
      throw new CatchException(e)
    }
  }

  async saveStockRecommend(stock: any[]){
    try {
      await this.redis.set(RedisKeys.saveStockRecommend, stock, {ttl: TimeToLive.OneYear})
    } catch (e) {
      throw new CatchException(e)
    }
  }
}

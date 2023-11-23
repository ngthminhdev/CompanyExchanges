import { CACHE_MANAGER, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as moment from 'moment';
import { TimeToLive } from '../enums/common.enum';
import { RedisKeys } from '../enums/redis-keys.enum';
import { CatchException, ExceptionResponse } from '../exceptions/common.exception';
import { MinioOptionService } from '../minio/minio.service';
import { MssqlService } from '../mssql/mssql.service';
import { UtilCommonTemplate } from '../utils/utils.common';
import { ExchangeRateResponse } from './response/exchangeRate.response';
import { ReportIndexResponse } from './response/index.response';
import { MerchandiseResponse } from './response/merchandise.response';
import { ITop, MorningHoseResponse } from './response/morningHose.response';
import { NewsEnterpriseResponse } from './response/newsEnterprise.response';
import { NewsInternationalResponse } from './response/newsInternational.response';
import { StockMarketResponse } from './response/stockMarket.response';

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

  async newsInternational() {
    try {
      const data = await this.mssqlService.query<NewsInternationalResponse[]>(`
      select distinct top 5 Title as title, Href as href, Date from macroEconomic.dbo.TinTucQuocTe order by Date desc
      `)
      const dataMapped = NewsInternationalResponse.mapToList(data)
      return dataMapped
    } catch (e) {
      throw new CatchException(e)
    }
  }

  async newsDomestic() {
    try {
      const data = await this.mssqlService.query<NewsInternationalResponse[]>(`
      select distinct top 5 Title as title, Href as href, Date from macroEconomic.dbo.TinTucViMo order by Date desc
      `)
      const dataMapped = NewsInternationalResponse.mapToList(data)
      return dataMapped
    } catch (e) {
      throw new CatchException(e)
    }
  }

  async newsEnterprise() {
    try {
      const data = await this.mssqlService.query<NewsEnterpriseResponse[]>(`
      select distinct top 7 TickerTitle as ticker, Title as title, Href as href, Date from macroEconomic.dbo.TinTuc where TickerTitle != '' order by Date desc
      `)
      const dataMapped = NewsEnterpriseResponse.mapToList(data)
      return dataMapped
    } catch (e) {
      throw new CatchException(e)
    }
  }

  async event() {
    try {
      const data = await this.mssqlService.query<NewsEnterpriseResponse[]>(`select distinct top 13 ticker, NoiDungSuKien as title, NgayDKCC as date from PHANTICH.dbo.LichSukien order by NgayDKCC desc`)
      const dataMapped = NewsEnterpriseResponse.mapToList(data)
      return dataMapped
    } catch (e) {
      throw new CatchException(e)
    }
  }

  async exchangeRate(){
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

  async merchandise(){
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

  async interestRate(){
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

  async stockMarket(){
    try {
      const name = `
      'Dow Jones', 'Nikkei 225', 'Shanghai', 'FTSE 100', 'DAX'
      `
      const sort = `case ${name.split(',').map((item, index) => `when name = ${item.replace(/\n/g, "").trim()} then ${index}`).join(' ')} end as row_num`
      const now = moment((await this.mssqlService.query(`select top 1 date from macroEconomic.dbo.WorldIndices order by date desc`))[0].date).format('YYYY-MM-DD')

      const date = await this.mssqlService.query(
        `with date_ranges as (
          select
              max(case when date <= '${moment(now).subtract(1, 'day').format('YYYY-MM-DD')}' then date else null end) as prev,
              max(case when date <= '${moment(now).subtract(1, 'month').format('YYYY-MM-DD')}' then date else null end) as month,
              max(case when date <= '${moment(now).startOf('year').format('YYYY-MM-DD')}' then date else null end) as ytd,
              max(case when date <= '${moment(now).subtract(1, 'year').format('YYYY-MM-DD')}' then date else null end) as year
          from macroEconomic.dbo.WorldIndices
      )
      select prev, month, ytd, year
      from date_ranges;`
      )
      
      const prev = moment(date[0].prev).format('YYYY-MM-DD')
      const month = moment(date[0].month).format('YYYY-MM-DD')
      const year = moment(date[0].year).format('YYYY-MM-DD')
      const ytd = moment(date[0].ytd).format('YYYY-MM-DD')

      const query = `
      WITH temp
      AS (SELECT
        date,
        name,
        closePrice,
        ${sort}
      FROM macroEconomic.dbo.WorldIndices
      WHERE name IN (${name})
      AND date IN ('${now}', '${prev}', '${year}', '${month}', '${ytd}'))
      SELECT
        name,
        [${now}] AS price,
        ([${now}] - [${prev}]) / [${prev}] * 100 AS day,
        ([${now}] - [${month}]) / [${month}] * 100 AS month,
        ([${now}] - [${year}]) / [${year}] * 100 AS year,
        ([${now}] - [${ytd}]) / [${ytd}] * 100 AS ytd
      FROM temp AS source PIVOT (SUM(closePrice) FOR date IN ([${now}], [${prev}], [${year}], [${month}], [${ytd}])) AS chuyen
      `

      const data = await this.mssqlService.query<StockMarketResponse[]>(query)
      const dataMapped = StockMarketResponse.mapToList(data)
      return dataMapped
    } catch (e) {
      throw new CatchException(e)
    }
  }

  async morning(){
    try {
      const query = `
      SELECT
        code,
        timeInday AS time,
        closePrice as price,
        change,
        perChange
      FROM tradeIntraday.dbo.indexTradeVNDIntraday
      WHERE code IN ('VNINDEX', 'HNX', 'UPCOM', 'VN30')
      AND date = (SELECT TOP 1
        date
      FROM tradeIntraday.dbo.indexTradeVNDIntraday
      ORDER BY date DESC)
      AND time >= '09:00:00'
      AND time <= '11:30:00'
      ORDER BY code ASC, timeInday DESC
      `
      const data = await this.mssqlService.query<any[]>(query)
      
      const reduceData = data.reduce((result, cur) => {
        const index = result.findIndex(item => item.code == cur.code)
        if(index == -1){
          result.push({code: cur.code, change: cur.change, perChange: cur.perChange, chart: [{time: UtilCommonTemplate.changeDateUTC(cur.time), value: cur.price}]})
        }else{
          result[index].chart.unshift({time: UtilCommonTemplate.changeDateUTC(cur.time), value: cur.price})
        }
        return result
      }, [])
      return reduceData
    } catch (e) {
      throw new CatchException(e)
    }
  }

  async morningHose(){
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
      WHERE time >= '10:30:00'),
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
      WHERE type = 'STOCK'
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
      WHERE type = 'STOCK'
      AND date = (SELECT
        MAX(date)
      FROM marketTrade.dbo.[foreign])
      AND floor = 'HOSE'
      AND netVal < 0
      ORDER BY netVal ASC
      `)

      const [data_1, data_2, data_3] = await Promise.all([promise_1, promise_2, promise_3])
      const dataMapped = new MorningHoseResponse({
        noChange: data_1[0].noChange,
        decline: data_1[0].decline,
        advance: data_1[0].advance,
        netVal: data_1[0].netVal,
        sell: data_2,
        buy: data_3
      })
      return dataMapped
    } catch (e) {
      throw new CatchException(e)
    }
  }

  async getImageStock(stock: string){
    try {
      const arr_stock = stock.split(',')
      const code = arr_stock.map(item => {
        if(item.length > 5) throw new ExceptionResponse(HttpStatus.BAD_REQUEST, 'Stock length invalid')
        return `'${item}'`
      }).join(',')
      const data: any[] = await this.mssqlService.query(`
      SELECT
        code,
        floor
      FROM marketInfor.dbo.info
      WHERE code IN (${code})
      `)
      return data.map(item => `/resources/stock/${item.code.toUpperCase()}_${item.floor}.jpg`)
    } catch (e) {
      throw new CatchException(e)
    }
  }
}

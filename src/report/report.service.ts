import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as moment from 'moment';
import { TimeToLive } from '../enums/common.enum';
import { RedisKeys } from '../enums/redis-keys.enum';
import { CatchException } from '../exceptions/common.exception';
import { MinioOptionService } from '../minio/minio.service';
import { MssqlService } from '../mssql/mssql.service';
import { UtilCommonTemplate } from '../utils/utils.common';
import { ReportIndexResponse } from './response/index.response';
import { NewsEnterpriseResponse } from './response/newsEnterprise.response';
import { NewsInternationalResponse } from './response/newsInternational.response';

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
      select distinct top 7 TickerInNews as ticker, Title as title, Href as href, Date from macroEconomic.dbo.TinTuc order by Date desc
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
        if(!result?.[cur.code]) {
          result[cur.code] = {change: cur.change, perChange: cur.perChange, chart: [{time: UtilCommonTemplate.changeDateUTC(cur.time), value: cur.price}]}
        }else{
          result[cur.code].chart.unshift({time: UtilCommonTemplate.changeDateUTC(cur.time), value: cur.price})
        }
        return result
      }, {});
      
      return reduceData
    } catch (e) {
      throw new CatchException(e)
    }
  }

  async morningHose(){
    try {
      
    } catch (e) {
      throw new CatchException(e)
    }
  }
}

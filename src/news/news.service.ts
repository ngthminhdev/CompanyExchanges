import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as moment from 'moment';
import { TimeToLive } from '../enums/common.enum';
import { RedisKeys } from '../enums/redis-keys.enum';
import { MssqlService } from '../mssql/mssql.service';
import { PageLimitDto } from './dto/page-limit.dto';
import { NewsEventResponse } from './response/event.response';
import { MacroDomesticResponse } from './response/macro-domestic.response';
import { NewsEnterpriseResponse } from './response/news-enterprise.response';
import { NewsFilterDto } from './dto/news-filter.dto';
import { NewsFilterResponse } from './response/news-filter.response';
import { EventDto } from './dto/event.dto';

@Injectable()
export class NewsService {
  constructor(
    private readonly mssqlService: MssqlService,
    @Inject(CACHE_MANAGER)
    private readonly redis: Cache
  ){}
  async getEvent(q: EventDto){
    const limit = +q.limit || 20
    const page = +q.page || 1

    const exchange = q.exchange.toLowerCase() != 'all' ? `('${q.exchange}')` : `('HOSE', 'UPCOM', 'HNX')` 

    const redisData = await this.redis.get(`${RedisKeys.newsEvent}:${page}:${limit}:${exchange}`)
    if(redisData) return redisData

    const query = `
    SELECT 
      ticker AS code,
      san AS exchange,
      NgayDKCC AS date_dkcc,
      NgayThucHien AS date,
      NgayGDKHQ AS date_gdkhq,
      NoiDungSuKien AS content,
      LoaiSuKien AS type
    FROM PHANTICH.dbo.LichSukien
    WHERE LoaiSuKien IN (
        N'Trả cổ tức bằng tiền mặt',
        N'Trả cổ tức bằng cổ phiếu',
        N'Thưởng cổ phiếu',
        N'Phát hành thêm'
    )
    and san IN ${exchange}
    ORDER BY NgayDKCC desc
    OFFSET ${(page - 1) * limit} ROWS
    FETCH NEXT ${limit} ROWS ONLY;
    `

    const data = await this.mssqlService.query<NewsEventResponse[]>(query)
    const dataMapped = NewsEventResponse.mapToList(data)
    await this.redis.set(`${RedisKeys.newsEvent}:${page}:${limit}:${exchange}`, dataMapped, {ttl: TimeToLive.OneHour})
    return dataMapped
  }

  async newsEnterprise(){
    const redisData = await this.redis.get(`${RedisKeys.newsEnterprise}`)
    if(redisData) return redisData
    const query = `
    SELECT
        n.date,
        title,
        href,
        ticker as code,
        closePrice,
        perChange,
        change
    FROM PHANTICH.dbo.TinTuc n
    INNER JOIN marketTrade.dbo.tickerTradeVND t
      ON ticker = t.code
      AND t.date = '${moment().format('YYYY-MM-DD')}'
    WHERE Href NOT LIKE 'https://cafef.vn%'  
    AND Href NOT LIKE 'https://ndh.vn%'
    ORDER BY n.date DESC
    `
    const data = await this.mssqlService.query<NewsEnterpriseResponse[]>(query)
    const dataMapped = NewsEnterpriseResponse.mapToList(data)
    await this.redis.set(`${RedisKeys.newsEnterprise}`, dataMapped, {ttl: TimeToLive.OneHour})
    return dataMapped
  }

  async macroDomestic(q: PageLimitDto){
    const limit = +q.limit || 20
    const page = +q.page || 1

    const query = `
    SELECT distinct
        Date AS date,
        Title AS title,
        Href AS href,
        Img AS img,
        SubTitle AS sub_title
    FROM macroEconomic.dbo.TinTucViMo
    WHERE Href NOT LIKE 'https://cafef.vn%'
    AND Href NOT LIKE 'https://ndh.vn%'
    ORDER BY Date DESC
    OFFSET ${(page - 1) * limit} ROWS
    FETCH NEXT ${limit} ROWS ONLY;
    `
    const data = await this.mssqlService.query<MacroDomesticResponse[]>(query)
    const dataMapped = MacroDomesticResponse.mapToList(data)
    return dataMapped
  }

  async macroInternational(q: PageLimitDto){
    const limit = +q.limit || 20
    const page = +q.page || 1

    const query = `
    SELECT distinct
        Date AS date,
        Title AS title,
        Href AS href,
        Img AS img,
        SubTitle AS sub_title
    FROM macroEconomic.dbo.TinTucQuocTe
    WHERE Href NOT LIKE 'https://cafef.vn%'
    AND Href NOT LIKE 'https://ndh.vn%'
    ORDER BY Date DESC
    OFFSET ${(page - 1) * limit} ROWS
    FETCH NEXT ${limit} ROWS ONLY;
    `

    const data = await this.mssqlService.query<MacroDomesticResponse[]>(query)
    const dataMapped = MacroDomesticResponse.mapToList(data)
    return dataMapped
  }

  async filter(){
    const redisData = await this.redis.get(RedisKeys.filter)
    if(redisData) return redisData

    const query = `
      select code, floor, LV2, LV4 from marketInfor.dbo.info
      where type IN ('STOCK', 'ETF')
      and floor IN ('HOSE', 'HNX', 'UPCOM')
      and status = 'listed'
      and LV4 != ''
      and LV2 != ''
      order by floor desc
    `
    const data = await this.mssqlService.query<any[]>(query)

    const result = data.reduce((acc, cur) => {
      const index_floor = acc.findIndex(item => item.name == cur.floor)
      
      if(acc.length == 0 || index_floor == -1){
        acc.push({name: cur.floor, LV2: [{name: cur.LV2, LV4: [{name: cur.LV4, code: [cur.code]}]}]})
        return acc
      }
      const index_lv2 = acc[index_floor].LV2.findIndex(item => item.name == cur.LV2)
      
      if(index_lv2 == -1){
         acc[index_floor].LV2.push({name: cur.LV2, LV4: [{name: cur.LV4, code: [cur.code]}]})
         return acc
      }
      
      const index_lv4 = acc[index_floor].LV2[index_lv2].LV4.findIndex(item => item.name == cur.LV4)
      if(index_lv4 == -1){
        acc[index_floor].LV2[index_lv2].LV4.push({name: cur.LV4, code: [cur.code]})
        return acc
      }
      acc[index_floor].LV2[index_lv2].LV4[index_lv4].code.push(cur.code)

      return acc
    }, [])

    await this.redis.set(RedisKeys.filter, result, {ttl: TimeToLive.OneWeek})
    return result
  }

  async newsFilter(q: NewsFilterDto){
    const limit = +q.limit || 20
    const page = +q.page || 1
    const code = q.code.split(',')
    
    const redisData = await this.redis.get(`${RedisKeys.newsFilter}:${page}:${limit}:${code}`)
    if(redisData) return redisData

    const query = `
    select distinct Title as title, Href as href, Date as date, Img as img, TickerTitle as code from macroEconomic.dbo.TinTuc
    ${q.code ? `where TickerTitle in (${code.map(item => `'${item}'`).join(',')})` : `where TickerTitle != ''`}
    AND Href NOT LIKE 'https://cafef.vn%'
    AND Href NOT LIKE 'https://ndh.vn%'
    ORDER BY Date DESC
    OFFSET ${(page - 1) * limit} ROWS
    FETCH NEXT ${limit} ROWS ONLY;
    `
    const data = await this.mssqlService.query<NewsFilterResponse[]>(query)
    const dataMapped = NewsFilterResponse.mapToList(data)
    await this.redis.set(`${RedisKeys.newsFilter}:${page}:${limit}:${code}`, dataMapped, {ttl: TimeToLive.HaftHour})
    return dataMapped
  }
}


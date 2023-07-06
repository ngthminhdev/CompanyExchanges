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

@Injectable()
export class NewsService {
  constructor(
    private readonly mssqlService: MssqlService,
    @Inject(CACHE_MANAGER)
    private readonly redis: Cache
  ){}
  async getEvent(ex: string){
    const exchange = ex ? `'${ex}'` : `'HNX', 'HSX', 'UPCOM'`
    const redisData = await this.redis.get(`${RedisKeys.newsEvent}:${exchange}`)
    if(redisData) return redisData
    const query = `
    SELECT
      ticker AS code,
      san AS floor,
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
    AND san IN (${exchange})
    `
    const data = await this.mssqlService.query<NewsEventResponse[]>(query)
    const dataMapped = NewsEventResponse.mapToList(data)
    await this.redis.set(`${RedisKeys.newsEvent}:${exchange}`, dataMapped, {ttl: TimeToLive.OneHour})
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
    SELECT
        Date AS date,
        Title AS title,
        Href AS href,
        Img AS img,
        SubTitle AS sub_title
    FROM macroEconomic.dbo.TinTucViMo
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
    SELECT
        Date AS date,
        Title AS title,
        Href AS href,
        Img AS img,
        SubTitle AS sub_title
    FROM macroEconomic.dbo.TinTucQuocTe
    ORDER BY Date DESC
    OFFSET ${(page - 1) * limit} ROWS
    FETCH NEXT ${limit} ROWS ONLY;
    `
    const data = await this.mssqlService.query<MacroDomesticResponse[]>(query)
    const dataMapped = MacroDomesticResponse.mapToList(data)
    return dataMapped
  }

  
}


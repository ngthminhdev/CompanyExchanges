import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { TimeToLive, TimeTypeEnum } from '../enums/common.enum';
import { Cache } from 'cache-manager';
import { RedisKeys } from '../enums/redis-keys.enum';
import { MssqlService } from '../mssql/mssql.service';
import { RetailValueResponse } from './responses/retail-value.response';

@Injectable()
export class RetailService {
  constructor(
    private readonly mssqlService: MssqlService,
    @Inject(CACHE_MANAGER)
    private readonly redis: Cache
  ) { }

  async retailValue(order: number) {
    const redisData = await this.redis.get(RedisKeys.retailValue)
    if(redisData) return redisData

    let date: string = ''
    switch (order) {
      case TimeTypeEnum.Month:
        date = `thoiDiem as date,`
        break
      case TimeTypeEnum.Quarter:
        date = `datepart(qq, thoiDiem) as date,
                datepart(year, thoiDiem) as year,`
        break
      case TimeTypeEnum.Year:
        date = `datepart(year, thoiDiem) as date,`
        break
      default:
        date = `thoiDiem as date,`
    }
    const query: string = `
      select chiTieu  as name,
            ${date}
            ${order == TimeTypeEnum.Month ? `giaTri as value` : `sum(giaTri) as value`}
      from macroEconomic.dbo.DuLieuViMo
      where phanBang = N'BÁN LẺ'
      and nhomDulieu = N'GIÁ TRỊ DOANH THU BÁN LẺ ( TỶ VNĐ)'
      and chiTieu IN (
                    N'Bán lẻ: Thương nghiệp (Tỷ VNĐ)',
                    N'Bán lẻ: Khách sạn nhà hàng (Tỷ VNĐ)',
                    N'Bán lẻ: Dịch vụ (Tỷ VNĐ)',
                    N'Bán lẻ: Du lịch (Tỷ VNĐ)'
      )
      and thoiDiem >= '2018-01-01 00:00:00.000'
    ${order != TimeTypeEnum.Month ? `group by datepart(qq, thoiDiem), datepart(year, thoiDiem), chiTieu` : ``}
    
    `
    const data = await this.mssqlService.query<RetailValueResponse[]>(query)
    const mappedData = RetailValueResponse.mapToList(data, order)
    await this.redis.set(RedisKeys.retailValue, mappedData, {ttl: TimeToLive.OneWeek})
    return mappedData
  }

  async retailPercentValue(order: number){
    const redisData = await this.redis.get(RedisKeys.retailPercentValue)
    if(redisData) return redisData

    const query: string = `
      SELECT  [chiTieu]  AS [name]
      ,${order == TimeTypeEnum.Month ? `[thoiDiem] AS [date], [giaTri] AS [value]` 
      : `datepart(year, thoiDiem) as [date], sum(giaTri) as [value]`}
      FROM [macroEconomic].[dbo].[DuLieuViMo]
      WHERE [thoiDiem] >= '2018-01-01 00:00:00.000'
      and phanBang = N'BÁN LẺ'
      and nhomDulieu = N'GIÁ TRỊ DOANH THU BÁN LẺ ( TỶ VNĐ)'
      AND [chiTieu] IN ( 
          N'Bán lẻ: Thương nghiệp (Tỷ VNĐ)', 
          N'Bán lẻ: Khách sạn nhà hàng (Tỷ VNĐ)', 
          N'Bán lẻ: Dịch vụ (Tỷ VNĐ)', 
          N'Bán lẻ: Du lịch (Tỷ VNĐ)')
      ${order == TimeTypeEnum.Year ? 'group by datepart(year, thoiDiem), chiTieu' : ``}
    `
    
    const data = await this.mssqlService.query<RetailValueResponse[]>(query)

    const mappedData = data.map((item, index) => {
      return new RetailValueResponse({...item, value: (item.value - data[index - 1]?.value || 0) / data[index - 1]?.value || 0 * 100, order})
    })

    await this.redis.set(RedisKeys.retailPercentValue, mappedData, {
      ttl: TimeToLive.OneWeek,
    })

    return mappedData
  }

  async retailValueTotal() {
    const redisData = await this.redis.get(RedisKeys.retailValueTotal)
    if(redisData) return redisData

    const query = `
        WITH temp
        AS (SELECT
          thoiDiem AS date,
          SUM(giaTri) OVER (PARTITION BY thoiDiem) AS value,
          ROW_NUMBER() OVER (PARTITION BY thoiDiem ORDER BY thoiDiem) AS rn
        
        FROM [macroEconomic].[dbo].[DuLieuViMo]
        WHERE [thoiDiem] >= '2018-01-01 00:00:00.000'
        AND phanBang = N'BÁN LẺ'
        AND nhomDulieu = N'GIÁ TRỊ DOANH THU BÁN LẺ ( TỶ VNĐ)'
        AND [chiTieu] IN (
        N'Bán lẻ: Thương nghiệp (Tỷ VNĐ)',
        N'Bán lẻ: Khách sạn nhà hàng (Tỷ VNĐ)',
        N'Bán lẻ: Dịch vụ (Tỷ VNĐ)',
        N'Bán lẻ: Du lịch (Tỷ VNĐ)'))
        SELECT
          'Tong' AS name,
          value,
          date
        FROM temp
        WHERE rn = 1
        UNION ALL
        SELECT
          chiTieu AS name,
          giaTri AS value,
          thoiDiem AS date
        FROM macroEconomic.dbo.DuLieuViMo
        WHERE phanBang = N'BÁN LẺ'
        AND nhomDulieu = N'GIÁ TRỊ DOANH THU BÁN LẺ ( TỶ VNĐ)'
        AND chiTieu IN (
        N'Bán lẻ: Thương nghiệp (Tỷ VNĐ)',
        N'Bán lẻ: Khách sạn nhà hàng (Tỷ VNĐ)',
        N'Bán lẻ: Dịch vụ (Tỷ VNĐ)',
        N'Bán lẻ: Du lịch (Tỷ VNĐ)'
        )
        AND thoiDiem >= '2018-01-01 00:00:00.000'
    `
    
    const data = await this.mssqlService.query<RetailValueResponse[]>(query)
    
    const mappedData = RetailValueResponse.mapToList(data, 2)
    await this.redis.set(RedisKeys.retailValueTotal, mappedData, {ttl: TimeToLive.OneWeek})
    return mappedData
  }
}
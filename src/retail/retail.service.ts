import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { TimeToLive, TimeTypeEnum } from '../enums/common.enum';
import { Cache } from 'cache-manager';
import { RedisKeys } from '../enums/redis-keys.enum';
import { MssqlService } from '../mssql/mssql.service';
import { RetailValueResponse } from './responses/retail-value.response';
import { MainExportImportResponse } from './responses/main-import-export.response';

@Injectable()
export class RetailService {
  constructor(
    private readonly mssqlService: MssqlService,
    @Inject(CACHE_MANAGER)
    private readonly redis: Cache
  ) { }

  async retailValue(order: number) {
    const redisData = await this.redis.get(`${RedisKeys.retailValue}:${order}`)
    if(redisData) return redisData

    let date: string = ''
    let group: string = ''
    switch (order) {
      case TimeTypeEnum.Month:
        date = `thoiDiem as date,`
        break
      case TimeTypeEnum.Quarter:
        date = `case datepart(qq, thoiDiem)
        when 1 then cast(datepart(year, thoiDiem) as varchar) + '/03/31'
        when 2 then cast(datepart(year, thoiDiem) as varchar) + '/06/30'
        when 3 then cast(datepart(year, thoiDiem) as varchar) + '/09/30'
        when 4 then cast(datepart(year, thoiDiem) as varchar) + '/12/31'
        end as date,`
        group = `group by datepart(qq, thoiDiem), datepart(year, thoiDiem), chiTieu` 
        break
      case TimeTypeEnum.Year:
        date = `cast(datepart(year, thoiDiem) as varchar) + '/12/31' as date,`
        group = `group by datepart(year, thoiDiem), chiTieu`
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
    ${group}
    order by date asc
    `
    const data = await this.mssqlService.query<RetailValueResponse[]>(query)

    const mappedData = RetailValueResponse.mapToList(data, order)
    await this.redis.set(`${RedisKeys.retailValue}:${order}`, mappedData, {ttl: TimeToLive.OneWeek})
    return mappedData
  }

  async retailPercentValue(order: number){
    const redisData = await this.redis.get(`${RedisKeys.retailPercentValue}:${order}`)
    if(redisData) return redisData

    const query: string = `
      SELECT  [chiTieu]  AS [name]
      ,${order == TimeTypeEnum.Month ? `[thoiDiem] AS [date], [giaTri] AS [value]` 
      : `cast(datepart(year, thoiDiem) as varchar) + '/12/31' as [date], sum(giaTri) as [value]`}
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
      order by date asc
    `
    
    const data = await this.mssqlService.query<RetailValueResponse[]>(query)

    const mappedData = data.map((item, index) => {
      return new RetailValueResponse({...item, value: !data[index - 1]?.value ? 0 : (item?.value - data[index - 1]?.value || 0) / (data[index - 1]?.value || 1) * 100, order})
    })

    await this.redis.set(`${RedisKeys.retailPercentValue}:${order}`, mappedData, {
      ttl: TimeToLive.OneWeek
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
        WHERE [thoiDiem] >= '2018-02-01 00:00:00.000'
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
        AND thoiDiem >= '2018-02-01 00:00:00.000'
    `
    
    const data = await this.mssqlService.query<RetailValueResponse[]>(query)
    
    const mappedData = RetailValueResponse.mapToList(data, 2)
    await this.redis.set(RedisKeys.retailValueTotal, mappedData, {ttl: TimeToLive.OneWeek})
    return mappedData
  }

  async totalExportImport(order: number){
    const redisData = await this.redis.get(`${RedisKeys.exportImport}:${order}`)
    if(redisData) return redisData
    let date: string = ''
    let group: string = ''
    switch (order) {
      case TimeTypeEnum.Month:
        date = `thoiDiem as date,`
        break
      case TimeTypeEnum.Quarter:
        date = `case datepart(qq, thoiDiem)
        when 1 then cast(datepart(year, thoiDiem) as varchar) + '/03/31'
        when 2 then cast(datepart(year, thoiDiem) as varchar) + '/06/30'
        when 3 then cast(datepart(year, thoiDiem) as varchar) + '/09/30'
        when 4 then cast(datepart(year, thoiDiem) as varchar) + '/12/31'
        end as date,`
        group = `group by datepart(qq, thoiDiem), datepart(year, thoiDiem), chiTieu` 
        break
      case TimeTypeEnum.Year:
        date = `cast(datepart(year, thoiDiem) as varchar) + '/12/31' as date,`
        group = `group by datepart(year, thoiDiem), chiTieu`
        break
      default:
        date = `thoiDiem as date,`
    }
    const query: string = `
      select chiTieu as name,
            ${date}
            ${order == TimeTypeEnum.Month ? `giaTri as value` : `sum(giaTri) as value`}
      from macroEconomic.dbo.DuLieuViMo
      where phanBang = N'XUẤT NHẬP KHẨU'
      and nhomDulieu = N'Giá trị xuất nhập khẩu hàng hóa'
      and chiTieu IN (
        N'Nhập khẩu: Tổng trị giá Nhập khẩu (triệu USD)',
        N'Xuất khẩu: Tổng trị giá Xuất khẩu (triệu USD)'
      )
      and thoiDiem >= '2018-01-01 00:00:00.000'
    ${group}
    order by date asc
    `
    const data = await this.mssqlService.query<RetailValueResponse[]>(query)
    const mappedData = RetailValueResponse.mapToList(data, order)
    await this.redis.set(`${RedisKeys.exportImport}:${order}`, mappedData, {ttl: TimeToLive.OneWeek})
    return mappedData
  }

  async mainExportImport(){
    const redisData = await this.redis.get(RedisKeys.exportImportMain)
    if(redisData) return redisData
    const query = `
        WITH temp
        AS (SELECT
          chiTieu AS name,
          thoiDiem AS date,
          giaTri AS value,
          phanBang
        
        FROM macroEconomic.dbo.DuLieuViMo
        WHERE (phanBang = N'NHẬP KHẨU')
        AND nhomDulieu = N'Thị trường nhập khẩu chính'
        AND thoiDiem >= '2018-01-01 00:00:00.000'
        UNION ALL
        SELECT
          chiTieu AS name,
          thoiDiem AS date,
          giaTri AS value,
          phanBang
        FROM macroEconomic.dbo.DuLieuViMo
        WHERE (phanBang = N'XUẤT KHẨU')
        AND nhomDulieu = N'Thị trường xuất khẩu chính'
        AND thoiDiem >= '2018-01-01 00:00:00.000'
        ),
        data
        AS (SELECT
          name,
          date,
          [XUẤT KHẨU] AS xk,
          [NHẬP KHẨU] AS nk
        FROM (SELECT
          LTRIM(SUBSTRING(name, 21, LEN(name))) AS name,
          date,
          value,
          phanBang
        FROM temp) AS source
        PIVOT (
        SUM(value)
        FOR phanBang IN ([XUẤT KHẨU], [NHẬP KHẨU])
        ) AS pvtable)
        SELECT
          *,
          xk - nk AS net_xnk
        FROM data
        GROUP BY name,
                date,
                xk,
                nk
        ORDER BY name, date
    `
    const data = await this.mssqlService.query<MainExportImportResponse[]>(query)
    const mapped_data = MainExportImportResponse.mapToList(data)
    await this.redis.set(RedisKeys.exportImportMain, mapped_data, {ttl: TimeToLive.OneWeek})
    return mapped_data
  }

  async mainExportImportMH(order: number){
    const redisData = await this.redis.get(`${RedisKeys.exportImportMainMH}:${order}`)
    if(redisData) return redisData

    let date: string = ''
    let group: string = ''
    switch (order) {
      case TimeTypeEnum.Month:
        date = `thoiDiem as date,`
        break
      case TimeTypeEnum.Quarter:
        date = `case datepart(qq, thoiDiem)
        when 1 then cast(datepart(year, thoiDiem) as varchar) + '/03/31'
        when 2 then cast(datepart(year, thoiDiem) as varchar) + '/06/30'
        when 3 then cast(datepart(year, thoiDiem) as varchar) + '/09/30'
        when 4 then cast(datepart(year, thoiDiem) as varchar) + '/12/31'
        end as date,`
        group = `group by datepart(qq, thoiDiem), datepart(year, thoiDiem), chiTieu` 
        break
      case TimeTypeEnum.Year:
        date = `cast(datepart(year, thoiDiem) as varchar) + '/12/31' as date,`
        group = `group by datepart(year, thoiDiem), chiTieu`
        break
      default:
        date = `thoiDiem as date,`
    }
    const query = 
    `
      select chiTieu as name,
            ${date}
            ${order == TimeTypeEnum.Month ? `giaTri as value` : `sum(giaTri) as value`}
      from macroEconomic.dbo.DuLieuViMo
      where phanBang = N'XUẤT NHẬP KHẨU'
      and nhomDulieu = N'Giá trị xuất nhập khẩu hàng hóa'
      and chiTieu IN (
        N'Xuất khẩu: Điện tử máy tính (triệu USD)',
        N'Xuất khẩu: Máy móc thiết bị (triệu USD)',
        N'Xuất khẩu: Dệt may (triệu USD)',
        N'Xuất khẩu: Giày da (triệu USD)',
        N'Xuất khẩu: Gỗ và sản phẩm gỗ (triệu USD)',
        N'Xuất khẩu: Thủy sản (triệu USD)',
        N'Xuất khẩu: Gạo (triệu USD)',
        N'Xuất khẩu: Café (triệu USD)',
        N'Xuất khẩu: Dầu thô (triệu USD)'
      )
      and thoiDiem >= '2018-01-01 00:00:00.000'
      ${group}
      order by date asc
      `
    const data = await this.mssqlService.query<RetailValueResponse[]>(query)
    const mapped_data = RetailValueResponse.mapToList(data, order)
    await this.redis.set(`${RedisKeys.exportImportMainMH}:${order}`, mapped_data, {ttl: TimeToLive.OneWeek})
    return mapped_data
  }

  async mainImportMH(order: number){
    const redisData = await this.redis.get(`${RedisKeys.importMainMH}:${order}`)
    if(redisData) return redisData

    let date: string = ''
    let group: string = ''
    switch (order) {
      case TimeTypeEnum.Month:
        date = `thoiDiem as date,`
        break
      case TimeTypeEnum.Quarter:
        date = `case datepart(qq, thoiDiem)
        when 1 then cast(datepart(year, thoiDiem) as varchar) + '/03/31'
        when 2 then cast(datepart(year, thoiDiem) as varchar) + '/06/30'
        when 3 then cast(datepart(year, thoiDiem) as varchar) + '/09/30'
        when 4 then cast(datepart(year, thoiDiem) as varchar) + '/12/31'
        end as date,`
        group = `group by datepart(qq, thoiDiem), datepart(year, thoiDiem), chiTieu` 
        break
      case TimeTypeEnum.Year:
        date = `cast(datepart(year, thoiDiem) as varchar) + '/12/31' as date,`
        group = `group by datepart(year, thoiDiem), chiTieu`
        break
      default:
        date = `thoiDiem as date,`
    }
    const query = 
    `
      select chiTieu as name,
            ${date}
            ${order == TimeTypeEnum.Month ? `giaTri as value` : `sum(giaTri) as value`}
      from macroEconomic.dbo.DuLieuViMo
      where phanBang = N'XUẤT NHẬP KHẨU'
      and nhomDulieu = N'Giá trị xuất nhập khẩu hàng hóa'
      and chiTieu IN (
        N'Nhập khẩu: Điện tử, máy tính và linh kiện (triệu USD)',
        N'Nhập khẩu: Máy móc thiết bị, phụ tùng (triệu USD)',
        N'Nhập khẩu: Sắt thép (triệu USD)',
        N'Nhập khẩu: Vải (triệu USD)',
        N'Nhập khẩu: Hóa chất (triệu USD)',
        N'Nhập khẩu: Ô tô (triệu USD)',
        N'Nhập khẩu: Sản phẩm hóa chất (triệu USD)',
        N'Nhập khẩu: Xăng dầu (triệu USD)',
        N'Nhập khẩu: Thức ăn gia súc (triệu USD)'
      )
      and thoiDiem >= '2018-01-01 00:00:00.000'
      ${group}
      order by date asc
      `
    const data = await this.mssqlService.query<RetailValueResponse[]>(query)
    const mapped_data = RetailValueResponse.mapToList(data, order)
    await this.redis.set(`${RedisKeys.importMainMH}:${order}`, mapped_data, {ttl: TimeToLive.OneWeek})
    return mapped_data
  } 
}

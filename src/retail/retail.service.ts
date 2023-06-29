import { Injectable } from '@nestjs/common';
import { TimeTypeEnum } from '../enums/common.enum';
import { MssqlService } from '../mssql/mssql.service';
import { RetailValueResponse } from './responses/retail-value.response';

@Injectable()
export class RetailService {
  constructor(
    private readonly mssqlService: MssqlService
  ) { }

  async retailValue(order: number) {
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

    return RetailValueResponse.mapToList(data, order)
  }
}

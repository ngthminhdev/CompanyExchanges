import { CACHE_MANAGER, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as moment from 'moment';
import { TimeToLive } from '../enums/common.enum';
import { RedisKeys } from '../enums/redis-keys.enum';
import { CatchException, ExceptionResponse } from '../exceptions/common.exception';
import { MssqlService } from '../mssql/mssql.service';
import { UtilCommonTemplate } from '../utils/utils.common';
import { EmulatorInvestmentDto } from './dto/emulator.dto';
import { InvestmentFilterDto } from './dto/investment-filter.dto';
import { InvestmentFilterResponse } from './response/investmentFilter.response';
import { KeyFilterResponse } from './response/keyFilter.response';

@Injectable()
export class InvestmentService {
  constructor(
    private readonly mssqlService: MssqlService,
    @Inject(CACHE_MANAGER)
    private readonly redis: Cache
  ) { }


  async filter(b: InvestmentFilterDto) {
    const result = b.filter.map(item => `${item.key} >= ${item.from} and ${item.key} <= ${item.to}`).join(` and `)
    const inds: string = b.industry ? UtilCommonTemplate.getIndustryFilter(b.industry.split(',')) : '';

    const query = `
    SELECT
      COUNT(*) OVER () as count, *
    FROM VISUALIZED_DATA.dbo.filterInvesting
    WHERE ${result}
    AND floor IN (${b.exchange.toUpperCase() == 'ALL' ? `'HOSE', 'HNX', 'UPCOM'` : `${b.exchange.split(',').map(item => `'${item.toUpperCase()}'`)}`})
    ${inds ? `AND LV2 IN ${inds}` : ``}
    AND LEN(code) = 3
    ORDER BY code asc
    `

    const data = await this.mssqlService.query<InvestmentFilterResponse[]>(query)
    const dataMapped = InvestmentFilterResponse.mapToList(data)
    return dataMapped

  }

  async keyFilter() {
    const redisData = await this.redis.get(`${RedisKeys.minMaxFilter}`)
    if (redisData) return redisData

    const columns = await this.mssqlService.query(`SELECT top 1 * FROM VISUALIZED_DATA.dbo.filterInvesting`)
    const arr_column = Object.keys(columns[0]).slice(3, Object.keys(columns[0]).length - 1)

    const ex = arr_column.map(item => `max([${item}]) as ${item}_max, min([${item}]) as ${item}_min`).join(', ')

    const query = `
    select
      count (*) over () as count
      ${ex}
    from VISUALIZED_DATA.dbo.filterInvesting
    where len(code) = 3
    `

    const data = await this.mssqlService.query(query)

    const dataMapped = KeyFilterResponse.mapToList(data[0])
    await this.redis.set(RedisKeys.minMaxFilter, dataMapped, { ttl: TimeToLive.OneHour })
    return dataMapped
  }

  async emulatorInvestment(b: EmulatorInvestmentDto) {
    try {
      const from = moment(b.from, 'M/YYYY')
      const to = moment(b.to, 'M/YYYY')

      if (to.month() == moment().month()) throw new ExceptionResponse(HttpStatus.BAD_REQUEST, 'To không được là tháng hiện tại')
      if (to.isBefore(from)) throw new ExceptionResponse(HttpStatus.BAD_REQUEST, 'From To không đúng')

      const query = `
    select closePrice / 1000 as closePrice, code, date from marketTrade.dbo.historyTicker 
    where date >= '${from.startOf('month').format('YYYY-MM-DD')}' 
    and date <= '${to.endOf('month').format('YYYY-MM-DD')}'
    and code in (${b.category.map(item => `'${item.code}'`).join(',')})
    order by date asc
    `
      const data: any[] = await this.mssqlService.query(query)

      const result = {}

      for (const item of b.category) {
        //Tính giá trị của mỗi cổ phiếu trong danh mục
        const gia_tri_danh_muc_1 = b.value * (item.category_1 / 100)
        const gia_tri_danh_muc_2 = b.value * (item.category_1 / 100)
        const gia_tri_danh_muc_3 = b.value * (item.category_1 / 100)

        const list_price = data.filter(i => i.code == item.code).map(item => item.closePrice);

        const so_tien_thu_duoc_danh_muc_1 = []
        const so_tien_thu_duoc_danh_muc_2 = []
        const so_tien_thu_duoc_danh_muc_3 = []

        const loi_nhuan_danh_muc_1 = []
        const loi_nhuan_danh_muc_2 = []
        const loi_nhuan_danh_muc_3 = []

        const gia_tri_danh_muc_cao_nhat_1 = Math.max(...list_price) * gia_tri_danh_muc_1
        const gia_tri_danh_muc_cao_nhat_2 = Math.max(...list_price) * gia_tri_danh_muc_2
        const gia_tri_danh_muc_cao_nhat_3 = Math.max(...list_price) * gia_tri_danh_muc_3

        const gia_tri_danh_muc_thap_nhat_1 = Math.min(...list_price) * gia_tri_danh_muc_1
        const gia_tri_danh_muc_thap_nhat_2 = Math.min(...list_price) * gia_tri_danh_muc_2
        const gia_tri_danh_muc_thap_nhat_3 = Math.min(...list_price) * gia_tri_danh_muc_3

        for (let i = 1; i <= list_price.length - 1; i++) {
          //Tính số tiền thu được
          so_tien_thu_duoc_danh_muc_1.push(gia_tri_danh_muc_1 / list_price[0] * list_price[i])
          so_tien_thu_duoc_danh_muc_2.push(gia_tri_danh_muc_2 / list_price[0] * list_price[i])
          so_tien_thu_duoc_danh_muc_3.push(gia_tri_danh_muc_3 / list_price[0] * list_price[i])

          //Tính lợi nhuân
          loi_nhuan_danh_muc_1.push(((gia_tri_danh_muc_1 / list_price[0] * list_price[i]) - gia_tri_danh_muc_1) / gia_tri_danh_muc_1 * 100)
          loi_nhuan_danh_muc_2.push(((gia_tri_danh_muc_2 / list_price[0] * list_price[i]) - gia_tri_danh_muc_2) / gia_tri_danh_muc_2 * 100)
          loi_nhuan_danh_muc_3.push(((gia_tri_danh_muc_3 / list_price[0] * list_price[i]) - gia_tri_danh_muc_3) / gia_tri_danh_muc_3 * 100)
        }

        result[item.code] = { so_tien_thu_duoc_danh_muc_1, so_tien_thu_duoc_danh_muc_2, so_tien_thu_duoc_danh_muc_3, loi_nhuan_danh_muc_1, loi_nhuan_danh_muc_2, loi_nhuan_danh_muc_3, gia_tri_danh_muc_cao_nhat_1, gia_tri_danh_muc_cao_nhat_2, gia_tri_danh_muc_cao_nhat_3, gia_tri_danh_muc_thap_nhat_1, gia_tri_danh_muc_thap_nhat_2, gia_tri_danh_muc_thap_nhat_3 }
      }

      let so_tien_thu_duoc_danh_muc_1_arr = []
      let so_tien_thu_duoc_danh_muc_2_arr = []
      let so_tien_thu_duoc_danh_muc_3_arr = []

      let loi_nhuan_danh_muc_1_arr = []
      let loi_nhuan_danh_muc_2_arr = []
      let loi_nhuan_danh_muc_3_arr = []

      let gia_tri_danh_muc_thap_nhat_1 = 0
      let gia_tri_danh_muc_thap_nhat_2 = 0
      let gia_tri_danh_muc_thap_nhat_3 = 0

      let gia_tri_danh_muc_cao_nhat_1 = 0
      let gia_tri_danh_muc_cao_nhat_2 = 0
      let gia_tri_danh_muc_cao_nhat_3 = 0

      for (const item of Object.keys(result)) {
        so_tien_thu_duoc_danh_muc_1_arr = this.addArrays(so_tien_thu_duoc_danh_muc_1_arr, result[item].so_tien_thu_duoc_danh_muc_1)
        so_tien_thu_duoc_danh_muc_2_arr = this.addArrays(so_tien_thu_duoc_danh_muc_2_arr, result[item].so_tien_thu_duoc_danh_muc_2)
        so_tien_thu_duoc_danh_muc_3_arr = this.addArrays(so_tien_thu_duoc_danh_muc_3_arr, result[item].so_tien_thu_duoc_danh_muc_3)

        loi_nhuan_danh_muc_1_arr = this.addArrays(loi_nhuan_danh_muc_1_arr, result[item].loi_nhuan_danh_muc_1)
        loi_nhuan_danh_muc_2_arr = this.addArrays(loi_nhuan_danh_muc_2_arr, result[item].loi_nhuan_danh_muc_2)
        loi_nhuan_danh_muc_3_arr = this.addArrays(loi_nhuan_danh_muc_3_arr, result[item].loi_nhuan_danh_muc_3)

        gia_tri_danh_muc_thap_nhat_1 += result[item].gia_tri_danh_muc_thap_nhat_1
        gia_tri_danh_muc_thap_nhat_2 += result[item].gia_tri_danh_muc_thap_nhat_2
        gia_tri_danh_muc_thap_nhat_3 += result[item].gia_tri_danh_muc_thap_nhat_3

        gia_tri_danh_muc_cao_nhat_1 += result[item].gia_tri_danh_muc_cao_nhat_1
        gia_tri_danh_muc_cao_nhat_2 += result[item].gia_tri_danh_muc_cao_nhat_2
        gia_tri_danh_muc_cao_nhat_3 += result[item].gia_tri_danh_muc_cao_nhat_3
      }

      const so_tien_thu_duoc_danh_muc_1 = so_tien_thu_duoc_danh_muc_1_arr[so_tien_thu_duoc_danh_muc_1_arr.length - 1]
      const so_tien_thu_duoc_danh_muc_2 = so_tien_thu_duoc_danh_muc_2_arr[so_tien_thu_duoc_danh_muc_2_arr.length - 1]
      const so_tien_thu_duoc_danh_muc_3 = so_tien_thu_duoc_danh_muc_3_arr[so_tien_thu_duoc_danh_muc_3_arr.length - 1]

      const loi_nhuan_danh_muc_1 = loi_nhuan_danh_muc_1_arr[loi_nhuan_danh_muc_1_arr.length - 1]
      const loi_nhuan_danh_muc_2 = loi_nhuan_danh_muc_2_arr[loi_nhuan_danh_muc_2_arr.length - 1]
      const loi_nhuan_danh_muc_3 = loi_nhuan_danh_muc_3_arr[loi_nhuan_danh_muc_3_arr.length - 1]

      const lai_thap_nhat_danh_muc_1 = Math.min(...loi_nhuan_danh_muc_1_arr.filter(item => item > 0))
      const lai_thap_nhat_danh_muc_2 = Math.min(...loi_nhuan_danh_muc_2_arr.filter(item => item > 0))
      const lai_thap_nhat_danh_muc_3 = Math.min(...loi_nhuan_danh_muc_3_arr.filter(item => item > 0))

      const lai_cao_nhat_danh_muc_1 = Math.max(...loi_nhuan_danh_muc_1_arr.filter(item => item > 0))
      const lai_cao_nhat_danh_muc_2 = Math.max(...loi_nhuan_danh_muc_2_arr.filter(item => item > 0))
      const lai_cao_nhat_danh_muc_3 = Math.max(...loi_nhuan_danh_muc_3_arr.filter(item => item > 0))

      const lai_trung_binh_danh_muc_1 = loi_nhuan_danh_muc_1_arr.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / loi_nhuan_danh_muc_1_arr.length;
      const lai_trung_binh_danh_muc_2 = loi_nhuan_danh_muc_2_arr.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / loi_nhuan_danh_muc_2_arr.length;
      const lai_trung_binh_danh_muc_3 = loi_nhuan_danh_muc_3_arr.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / loi_nhuan_danh_muc_3_arr.length;

      const loi_nhuan_am_cao_nhat_danh_muc_1 = Math.min(...loi_nhuan_danh_muc_1_arr.filter(item => item < 0))
      const loi_nhuan_am_cao_nhat_danh_muc_2 = Math.min(...loi_nhuan_danh_muc_2_arr.filter(item => item < 0))
      const loi_nhuan_am_cao_nhat_danh_muc_3 = Math.min(...loi_nhuan_danh_muc_3_arr.filter(item => item < 0))

      const rf = (await this.mssqlService.query(`select top 1 laiSuatPhatHanh as value from [marketBonds].[dbo].[BondsInfor] where code ='VCB' and kyHan =N'5 năm' order by ngayPhatHanh desc`))[0].value
      const sharpe_1 = this.sharpeCalculate(rf, loi_nhuan_danh_muc_1, (gia_tri_danh_muc_cao_nhat_1 + gia_tri_danh_muc_thap_nhat_1) / 2, gia_tri_danh_muc_cao_nhat_1)
      const sharpe_2 = this.sharpeCalculate(rf, loi_nhuan_danh_muc_2, (gia_tri_danh_muc_cao_nhat_2 + gia_tri_danh_muc_thap_nhat_2) / 2, gia_tri_danh_muc_cao_nhat_2)
      const sharpe_3 = this.sharpeCalculate(rf, loi_nhuan_danh_muc_3, (gia_tri_danh_muc_cao_nhat_3 + gia_tri_danh_muc_thap_nhat_3) / 2, gia_tri_danh_muc_cao_nhat_3)
      return result
    } catch (e) {
      throw new CatchException(e)
    }
  }

  private sharpeCalculate(rf: number, rp: number, TBGT_DM: number, gtcn: number) {
    return (rp - rf) / ((gtcn - TBGT_DM) / TBGT_DM)
  }

  private addArrays(...arrays) {
    const maxLength = Math.max(...arrays.map(arr => arr.length));
    const result = new Array(maxLength).fill(0);

    for (let i = 0; i < maxLength; i++) {
      for (const arr of arrays) {
        if (i < arr.length) {
          result[i] += arr[i];
        }
      }
    }

    return result;
  }

  private getMonth(
    count: number,
    date: moment.Moment | Date | string = new Date(),
    results = [],
  ): string[] {
    if (count === 0) {
      return results;
    }
    let previousEndDate: moment.Moment | Date | string;
    previousEndDate = moment(date).endOf('month');
    const resultDate = previousEndDate.format('YYYY-MM-DD');
    results.push(resultDate);

    return this.getMonth(count - 1, previousEndDate.subtract(1, 'month'), results);
  }
}

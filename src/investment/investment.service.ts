import { CACHE_MANAGER, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as moment from 'moment';
import * as calTech from 'technicalindicators';
import { TimeToLive } from '../enums/common.enum';
import { RedisKeys } from '../enums/redis-keys.enum';
import { CatchException, ExceptionResponse } from '../exceptions/common.exception';
import { MssqlService } from '../mssql/mssql.service';
import { UtilCommonTemplate } from '../utils/utils.common';
import { EmulatorInvestmentDto } from './dto/emulator.dto';
import { InvestmentFilterDto } from './dto/investment-filter.dto';
import { EmulatorInvestmentResponse } from './response/emulatorInvestment.response';
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

      const date = [...this.getMonth(to.diff(from, 'month') + 1, moment(b.to, 'M/YYYY').add(1, 'month')), from.startOf('month').format('YYYY-MM-DD')]

      // const query_date = (await this.mssqlService.query(`
      // with date_ranges as (
      //     select
      //     ${date.map((item, index) => `min(case when date >= '${item}' then date else null end) as date_${index + 1}`).join(',')}
      //     from marketTrade.dbo.historyTicker
      //     where date >= '${date[date.length - 1]}'
      // )
      // select *
      // from date_ranges;
      // `))[0]
      
      //Lấy giá cổ phiếu
      const query = `
      select closePrice / 1000 as closePrice, code, date from marketTrade.dbo.historyTicker 
      where date >= '${from.startOf('month').format('YYYY-MM-DD')}' 
      and date <= '${to.endOf('month').format('YYYY-MM-DD')}'
      and code in (${b.category.map(item => `'${item.code}'`).join(',')})
      order by date asc
      ` 
      // : `
      // select closePrice / 1000 as closePrice, code, date from marketTrade.dbo.historyTicker 
      // where date in (${Object.values(query_date).map(item => `'${UtilCommonTemplate.toDate(item)}'`).join(',')})
      // order by date asc
      // `

      //Lấy giá VNINDEX
      const query_2 = `
      select closePrice, code, date from marketTrade.dbo.indexTradeVND 
      where date >= '${from.startOf('month').format('YYYY-MM-DD')}' 
      and date <= '${to.endOf('month').format('YYYY-MM-DD')}'
      and code = 'VNINDEX'
      order by date asc
      `

      //Kỳ hạn 5 năm
      const query_3 = `
      select top 1 laiSuatPhatHanh as value from [marketBonds].[dbo].[BondsInfor] where code ='VCB' and kyHan =N'5 năm' order by ngayPhatHanh desc
      `

      const promise = this.mssqlService.query(query)
      const promise_2 = this.mssqlService.query(query_2)
      const promise_3 = this.mssqlService.query(query_3)

      const [data, data_2, data_3] = await Promise.all([promise, promise_2, promise_3]) as any

      const result = {}
      const date_arr = data.filter(item => item.code == b.category[0].code).map(item => item.date)

      for (const item of b.category) {
        // if (!b.isPeriodic) {
          //Tính giá trị của mỗi cổ phiếu trong danh mục
          const gia_tri_danh_muc_1 = b.value * (item.category_1 / 100)
          const gia_tri_danh_muc_2 = b.value * (item.category_2 / 100)
          const gia_tri_danh_muc_3 = b.value * (item.category_3 / 100)

          const list_price = data.filter(i => i.code == item.code).map(item => item.closePrice);

          const so_tien_thu_duoc_danh_muc_1 = []
          const so_tien_thu_duoc_danh_muc_2 = []
          const so_tien_thu_duoc_danh_muc_3 = []

          const loi_nhuan_danh_muc_1 = []
          const loi_nhuan_danh_muc_2 = []
          const loi_nhuan_danh_muc_3 = []

          //Tính giá trị danh mục
          const danh_muc_1 = list_price.map(item => item * gia_tri_danh_muc_1)
          const danh_muc_2 = list_price.map(item => item * gia_tri_danh_muc_2)
          const danh_muc_3 = list_price.map(item => item * gia_tri_danh_muc_3)
          //----------------------------

          const gia_tri_danh_muc_cao_nhat_1 = Math.max(...danh_muc_1)
          const gia_tri_danh_muc_cao_nhat_2 = Math.max(...danh_muc_2)
          const gia_tri_danh_muc_cao_nhat_3 = Math.max(...danh_muc_3)

          const gia_tri_danh_muc_thap_nhat_1 = Math.min(...danh_muc_1)
          const gia_tri_danh_muc_thap_nhat_2 = Math.min(...danh_muc_2)
          const gia_tri_danh_muc_thap_nhat_3 = Math.min(...danh_muc_3)

          for (let i = 1; i <= list_price.length - 1; i++) {
            //Tính số tiền thu được
            so_tien_thu_duoc_danh_muc_1.push(gia_tri_danh_muc_1 / list_price[0] * list_price[i])
            so_tien_thu_duoc_danh_muc_2.push(gia_tri_danh_muc_2 / list_price[0] * list_price[i])
            so_tien_thu_duoc_danh_muc_3.push(gia_tri_danh_muc_3 / list_price[0] * list_price[i])

            //Tính lợi nhuân
            loi_nhuan_danh_muc_1.push(((gia_tri_danh_muc_1 / list_price[0] * list_price[i]) - gia_tri_danh_muc_1) / gia_tri_danh_muc_1 * 100)
            loi_nhuan_danh_muc_2.push(((gia_tri_danh_muc_2 / list_price[0] * list_price[i]) - gia_tri_danh_muc_2) / gia_tri_danh_muc_2 * 100)
            loi_nhuan_danh_muc_3.push(((gia_tri_danh_muc_3 / list_price[0] * list_price[i]) - gia_tri_danh_muc_3) / gia_tri_danh_muc_3 * 100)
          // }
          result[item.code] = { so_tien_thu_duoc_danh_muc_1, so_tien_thu_duoc_danh_muc_2, so_tien_thu_duoc_danh_muc_3, loi_nhuan_danh_muc_1, loi_nhuan_danh_muc_2, loi_nhuan_danh_muc_3, gia_tri_danh_muc_cao_nhat_1, gia_tri_danh_muc_cao_nhat_2, gia_tri_danh_muc_cao_nhat_3, gia_tri_danh_muc_thap_nhat_1, gia_tri_danh_muc_thap_nhat_2, gia_tri_danh_muc_thap_nhat_3, danh_muc_1, danh_muc_2, danh_muc_3 }
        }



        // const tong_cp_ban_dau_danh_muc_1 = (b.value * item.category_1 / 100)
      }

      let so_tien_thu_duoc_danh_muc_1_arr = []
      let so_tien_thu_duoc_danh_muc_2_arr = []
      let so_tien_thu_duoc_danh_muc_3_arr = []

      let loi_nhuan_danh_muc_1_arr = []
      let loi_nhuan_danh_muc_2_arr = []
      let loi_nhuan_danh_muc_3_arr = []

      let danh_muc_1_arr = []
      let danh_muc_2_arr = []
      let danh_muc_3_arr = []

      let gia_tri_danh_muc_thap_nhat_1 = 0
      let gia_tri_danh_muc_thap_nhat_2 = 0
      let gia_tri_danh_muc_thap_nhat_3 = 0

      let gia_tri_danh_muc_cao_nhat_1 = 0
      let gia_tri_danh_muc_cao_nhat_2 = 0
      let gia_tri_danh_muc_cao_nhat_3 = 0

      let loi_nhuan_theo_co_phieu_1 = []
      let loi_nhuan_theo_co_phieu_2 = []
      let loi_nhuan_theo_co_phieu_3 = []

      for (const item of Object.keys(result)) {
        so_tien_thu_duoc_danh_muc_1_arr = this.addArrays(so_tien_thu_duoc_danh_muc_1_arr, result[item].so_tien_thu_duoc_danh_muc_1)
        so_tien_thu_duoc_danh_muc_2_arr = this.addArrays(so_tien_thu_duoc_danh_muc_2_arr, result[item].so_tien_thu_duoc_danh_muc_2)
        so_tien_thu_duoc_danh_muc_3_arr = this.addArrays(so_tien_thu_duoc_danh_muc_3_arr, result[item].so_tien_thu_duoc_danh_muc_3)

        loi_nhuan_danh_muc_1_arr = this.addArrays(loi_nhuan_danh_muc_1_arr, result[item].loi_nhuan_danh_muc_1)
        loi_nhuan_danh_muc_2_arr = this.addArrays(loi_nhuan_danh_muc_2_arr, result[item].loi_nhuan_danh_muc_2)
        loi_nhuan_danh_muc_3_arr = this.addArrays(loi_nhuan_danh_muc_3_arr, result[item].loi_nhuan_danh_muc_3)

        danh_muc_1_arr = this.addArrays(danh_muc_1_arr, result[item].danh_muc_1)
        danh_muc_2_arr = this.addArrays(danh_muc_2_arr, result[item].danh_muc_2)
        danh_muc_3_arr = this.addArrays(danh_muc_3_arr, result[item].danh_muc_3)

        gia_tri_danh_muc_thap_nhat_1 += result[item].gia_tri_danh_muc_thap_nhat_1
        gia_tri_danh_muc_thap_nhat_2 += result[item].gia_tri_danh_muc_thap_nhat_2
        gia_tri_danh_muc_thap_nhat_3 += result[item].gia_tri_danh_muc_thap_nhat_3

        gia_tri_danh_muc_cao_nhat_1 += result[item].gia_tri_danh_muc_cao_nhat_1
        gia_tri_danh_muc_cao_nhat_2 += result[item].gia_tri_danh_muc_cao_nhat_2
        gia_tri_danh_muc_cao_nhat_3 += result[item].gia_tri_danh_muc_cao_nhat_3

        loi_nhuan_theo_co_phieu_1.push(...result[item].loi_nhuan_danh_muc_1.map((i, index) => ({ code: item, value: i, date: date_arr[index + 1] })))
        loi_nhuan_theo_co_phieu_2.push(...result[item].loi_nhuan_danh_muc_2.map((i, index) => ({ code: item, value: i, date: date_arr[index + 1] })))
        loi_nhuan_theo_co_phieu_3.push(...result[item].loi_nhuan_danh_muc_3.map((i, index) => ({ code: item, value: i, date: date_arr[index + 1] })))
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

      const rf = data_3[0].value
      const sharpe_1 = this.sharpeCalculate(rf, loi_nhuan_danh_muc_1, (gia_tri_danh_muc_cao_nhat_1 + gia_tri_danh_muc_thap_nhat_1) / 2, gia_tri_danh_muc_cao_nhat_1)
      const sharpe_2 = this.sharpeCalculate(rf, loi_nhuan_danh_muc_2, (gia_tri_danh_muc_cao_nhat_2 + gia_tri_danh_muc_thap_nhat_2) / 2, gia_tri_danh_muc_cao_nhat_2)
      const sharpe_3 = this.sharpeCalculate(rf, loi_nhuan_danh_muc_3, (gia_tri_danh_muc_cao_nhat_3 + gia_tri_danh_muc_thap_nhat_3) / 2, gia_tri_danh_muc_cao_nhat_3)

      const roc_1 = (new calTech.ROC({ period: 1, values: danh_muc_1_arr })).result;
      const roc_2 = (new calTech.ROC({ period: 1, values: danh_muc_2_arr })).result;
      const roc_3 = (new calTech.ROC({ period: 1, values: danh_muc_3_arr })).result;

      const roc_tt = (new calTech.ROC({ period: 1, values: data_2.map(item => item.closePrice) })).result

      const beta_1 = this.betaCalculate(roc_1, roc_tt)
      const beta_2 = this.betaCalculate(roc_2, roc_tt)
      const beta_3 = this.betaCalculate(roc_3, roc_tt)

      const alpha_1 = this.alphaCalculate(loi_nhuan_danh_muc_1, rf, roc_tt[roc_tt.length - 1], beta_1)
      const alpha_2 = this.alphaCalculate(loi_nhuan_danh_muc_2, rf, roc_tt[roc_tt.length - 1], beta_2)
      const alpha_3 = this.alphaCalculate(loi_nhuan_danh_muc_3, rf, roc_tt[roc_tt.length - 1], beta_3)

      //Hiệu quả đầu tư theo danh mục
      const percent_loi_nhuan_danh_muc = loi_nhuan_danh_muc_1_arr.map((item, index) => ({ name: 'Danh mục 1', value: item, date: date_arr[index + 1] })).concat(loi_nhuan_danh_muc_2_arr.map((item, index) => ({ name: 'Danh mục 2', value: item, date: date_arr[index + 1] }))).concat(loi_nhuan_danh_muc_3_arr.map((item, index) => ({ name: 'Danh mục 3', value: item, date: date_arr[index + 1] })))
      const percent_loi_nhuan = [...roc_tt.map(item => ({ name: 'VNINDEX', value: item }))].map((item, index) => ({ ...item, date: date_arr[index + 1] })).concat(percent_loi_nhuan_danh_muc).sort((a, b) => Date.parse(a.date) - Date.parse(b.date)).map(item => ({ ...item, date: UtilCommonTemplate.toDate(item.date) }))

      //Hiệu quả đầu tư theo cổ phiếu
      const hieu_qua_dau_tu_co_phieu = {
        danh_muc_1: loi_nhuan_theo_co_phieu_1.sort((a, b) => Date.parse(a.date) - Date.parse(b.date)).map(item => ({ ...item, date: UtilCommonTemplate.toDate(item.date) })),
        danh_muc_2: loi_nhuan_theo_co_phieu_2.sort((a, b) => Date.parse(a.date) - Date.parse(b.date)).map(item => ({ ...item, date: UtilCommonTemplate.toDate(item.date) })),
        danh_muc_3: loi_nhuan_theo_co_phieu_3.sort((a, b) => Date.parse(a.date) - Date.parse(b.date)).map(item => ({ ...item, date: UtilCommonTemplate.toDate(item.date) })),
      }
      //Biểu đồ lãi lỗ theo danh mục
      const bieu_do_lai_lo_danh_muc = so_tien_thu_duoc_danh_muc_1_arr.map((item, index) => ({ name: 'Danh mục 1', value: item - b.value, date: UtilCommonTemplate.toDate(date_arr[index + 1]) })).concat(so_tien_thu_duoc_danh_muc_2_arr.map((item, index) => ({ name: 'Danh mục 2', value: item - b.value, date: UtilCommonTemplate.toDate(date_arr[index + 1]) }))).concat(so_tien_thu_duoc_danh_muc_3_arr.map((item, index) => ({ name: 'Danh mục 3', value: item - b.value, date: UtilCommonTemplate.toDate(date_arr[index + 1]) })))
      const bieu_do_lai_lo_vn_index = data_2.map((item) => ({ name: item.code, value: item.closePrice - data_2[0].closePrice, date: UtilCommonTemplate.toDate(item.date) })).slice(1, data_2.length)
      const bieu_do_lai_lo = bieu_do_lai_lo_danh_muc.concat(bieu_do_lai_lo_vn_index).sort((a, b) => Date.parse(a.date) - Date.parse(b.date))

      const dataMapped = EmulatorInvestmentResponse.mapToList({
        value: b.value,
        so_tien_thu_duoc_danh_muc_1,
        so_tien_thu_duoc_danh_muc_2,
        so_tien_thu_duoc_danh_muc_3,
        loi_nhuan_danh_muc_1,
        loi_nhuan_danh_muc_2,
        loi_nhuan_danh_muc_3,
        lai_thap_nhat_danh_muc_1,
        lai_thap_nhat_danh_muc_2,
        lai_thap_nhat_danh_muc_3,
        lai_cao_nhat_danh_muc_1,
        lai_cao_nhat_danh_muc_2,
        lai_cao_nhat_danh_muc_3,
        lai_trung_binh_danh_muc_1,
        lai_trung_binh_danh_muc_2,
        lai_trung_binh_danh_muc_3,
        loi_nhuan_am_cao_nhat_danh_muc_1,
        loi_nhuan_am_cao_nhat_danh_muc_2,
        loi_nhuan_am_cao_nhat_danh_muc_3,
        sharpe_1,
        sharpe_2,
        sharpe_3,
        beta_1,
        beta_2,
        beta_3,
        alpha_1,
        alpha_2,
        alpha_3,
        percent_loi_nhuan,
        hieu_qua_dau_tu_co_phieu,
        bieu_do_lai_lo
      })
      return dataMapped
    } catch (e) {
      throw new CatchException(e)
    }
  }

  // async search(stock: string){

  // }

  private sharpeCalculate(rf: number, rp: number, TBGT_DM: number, gtcn: number) {
    return (rp - rf) / ((gtcn - TBGT_DM) / TBGT_DM)
  }

  private betaCalculate(roc_danh_muc: number[], roc_tt: number[]) {
    return this.calculateCovariance(roc_danh_muc, roc_tt) / this.calculateVariance(roc_tt)
  }

  private alphaCalculate(rp: number, rf: number, rm: number, beta: number) {
    return rp - (rf + (rm - rf) * beta)
  }

  private calculateVariance(data: number[]) {
    if (data.length < 2) {
      throw new Error("Tập dữ liệu phải có ít nhất 2 giá trị.");
    }

    const N = data.length;
    const mean = data.reduce((sum, value) => sum + value, 0) / N;

    let variance = 0;

    for (let i = 0; i < N; i++) {
      variance += (data[i] - mean) ** 2;
    }

    variance /= (N - 1); // Chia cho (N-1) để tính variance mẫu

    return variance;
  }


  private calculateCovariance(X: number[], Y: number[]) {
    if (X.length !== Y.length || X.length < 2) {
      throw new Error("X và Y phải có cùng độ dài và ít nhất 2 giá trị.");
    }

    const N = X.length;
    const meanX = X.reduce((sum, value) => sum + value, 0) / N;
    const meanY = Y.reduce((sum, value) => sum + value, 0) / N;

    let covariance = 0;

    for (let i = 0; i < N; i++) {
      covariance += (X[i] - meanX) * (Y[i] - meanY);
    }

    covariance /= (N - 1); // Chia cho (N-1) để tính covariance mẫu

    return covariance;
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
  ) {
    if (count === 0) {
      return results
    }
    let previousEndDate: moment.Moment | Date | string;
    previousEndDate = moment(date).subtract(1, 'month').endOf('month');
    results.push(previousEndDate.format('YYYY-MM-DD'));

    return this.getMonth(count - 1, previousEndDate, results);
  }
}

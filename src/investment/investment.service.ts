import { CACHE_MANAGER, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as moment from 'moment';
import { TimeToLive } from '../enums/common.enum';
import { RedisKeys } from '../enums/redis-keys.enum';
import { ExceptionResponse } from '../exceptions/common.exception';
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
    OFFSET ${(b.page - 1) * b.limit} ROWS
    FETCH NEXT ${b.limit} ROWS ONLY;
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
    const from = moment(b.from, 'M/YYYY')
    const to = moment(b.to, 'M/YYYY')

    // console.log(b);
    

    const data_1 = this.getMonth(to.diff(from, 'month'), to)

    if (to.month() == moment().month()) throw new ExceptionResponse(HttpStatus.BAD_REQUEST, 'To không được là tháng hiện tại')
    if (to.isBefore(from)) throw new ExceptionResponse(HttpStatus.BAD_REQUEST, 'From To không đúng')
    
    const date = (await this.mssqlService.query(`
    with date_ranges as (
        select
            ${data_1.map((item, index) => `min(case when date >= '${item}' then date else null end) as date_${index + 1}`).join(',')}
        from marketTrade.dbo.tickerTradeVND
        where date >= '${data_1[data_1.length - 1]}'
    )
    select *
    from date_ranges;
    `))[0]

    const query = ``
    const data = await this.mssqlService.query(query)
    return data
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

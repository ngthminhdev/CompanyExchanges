import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { TimeToLive } from '../enums/common.enum';
import { RedisKeys } from '../enums/redis-keys.enum';
import { MssqlService } from '../mssql/mssql.service';
import { UtilCommonTemplate } from '../utils/utils.common';
import { InvestmentFilterDto } from './dto/investment-filter.dto';
import { InvestmentFilterResponse } from './response/investmentFilter.response';
import { KeyFilterResponse } from './response/keyFilter.response';

@Injectable()
export class InvestmentService {
  constructor(
    private readonly mssqlService: MssqlService,
    @Inject(CACHE_MANAGER)
    private readonly redis: Cache
  ){}


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
    ORDER BY code asc
    OFFSET ${(b.page - 1) * b.limit} ROWS
    FETCH NEXT ${b.limit} ROWS ONLY;
    `
    
    const data = await this.mssqlService.query<InvestmentFilterResponse[]>(query)
    const dataMapped = InvestmentFilterResponse.mapToList(data)
    return dataMapped
    
  }

  async keyFilter(){
    const redisData = await this.redis.get(`${RedisKeys.minMaxFilter}`)
    if(redisData) return redisData

    const columns = await this.mssqlService.query(`SELECT top 1 * FROM VISUALIZED_DATA.dbo.filterInvesting`)
    const arr_column = Object.keys(columns[0]).slice(3, Object.keys(columns[0]).length - 1)
    
    const ex = arr_column.map(item => `max([${item}]) as ${item}_max, min([${item}]) as ${item}_min`).join(', ')
    
    const query = `
    select
      ${ex}
    from VISUALIZED_DATA.dbo.filterInvesting
    `
    
    const data = await this.mssqlService.query(query)
    
    const dataMapped = KeyFilterResponse.mapToList(data[0])
    await this.redis.set(RedisKeys.minMaxFilter, dataMapped, {ttl: TimeToLive.OneHour})
    return dataMapped
  }
}

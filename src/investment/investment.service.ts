import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { TimeToLive } from '../enums/common.enum';
import { RedisKeys } from '../enums/redis-keys.enum';
import { MssqlService } from '../mssql/mssql.service';
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
    
    const query = `
    SELECT
      COUNT(*) OVER () as count, [Lợi nhuận sau thuế tổng 4 quý] as LNST_4_Quarter, [Lợi nhuận sau thuế] as LNST, [Vốn chủ sở hữu] as VCSH, *
    FROM VISUALIZED_DATA.dbo.filterInvesting
    WHERE ${result}
    AND floor IN (${b.exchange.toUpperCase() == 'ALL' ? `'HOSE', 'HNX', 'UPCOM'` : `${b.exchange.split(',').map(item => `'${item.toUpperCase()}'`)}`})
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
    
    const query = `
    select
      max(MARKETCAP) as MARKETCAP_max, min(MARKETCAP) as MARKETCAP_min,
      max(closePrice) as closePrice_max, min(closePrice) as closePrice_min,
      max(SHAREOUT) as SHAREOUT_max, min(SHAREOUT) as SHAREOUT_min,
      max(PE) as PE_max, min(PE) as PE_min,
      max(PB) as PB_max, min(PB) as PB_min,
      max(EPS) as EPS_max, min(EPS) as EPS_min,
      max(BVPS) as BVPS_max, min(BVPS) as BVPS_min,
      max(EBIT) as EBIT_max, min(EBIT) as EBIT_min,
      max(ROA) as ROA_max, min(ROA) as ROA_min,
      max(ROE) as ROE_max, min(ROE) as ROE_min,
      max(DSCR) as DSCR_max, min(DSCR) as DSCR_min,
      max(totalDebtToTotalAssets) as totalDebtToTotalAssets_max, min(totalDebtToTotalAssets) as totalDebtToTotalAssets_min,
      max(ACR) as ACR_max, min(ACR) as ACR_min,
      max(currentRatio) as currentRatio_max, min(currentRatio) as currentRatio_min,
      max(quickRatio) as quickRatio_max, min(quickRatio) as quickRatio_min,
      max(cashRatio) as cashRatio_max, min(cashRatio) as cashRatio_min,
      max(interestCoverageRatio) as interestCoverageRatio_max, min(interestCoverageRatio) as interestCoverageRatio_min,
      max(FAT) as FAT_max, min(FAT) as FAT_min,
      max(ATR) as ATR_max, min(ATR) as ATR_min,
      max(CTR) as CTR_max, min(CTR) as CTR_min,
      max(CT) as CT_max, min(CT) as CT_min,
      max(totalVol) as totalVol_max, min(totalVol) as totalVol_min,
      max(totalVol_AVG_5) as totalVol_AVG_5_max, min(totalVol_AVG_5) as totalVol_AVG_5_min,
      max(totalVol_AVG_10) as totalVol_AVG_10_max, min(totalVol_AVG_10) as totalVol_AVG_10_min,
      max(totalVol_MIN_5) as totalVol_MIN_5_max, min(totalVol_MIN_5) as totalVol_MIN_5_min,
      max(totalVol_MIN_10) as totalVol_MIN_10_max, min(totalVol_MIN_10) as totalVol_MIN_10_min,
      max(totalVol_MAX_5) as totalVol_MAX_5_max, min(totalVol_MAX_5) as totalVol_MAX_5_min,
      max(totalVol_MAX_10) as totalVol_MAX_10_max, min(totalVol_MAX_10) as totalVol_MAX_10_min,
      max(growthRevenue) as growthRevenue_max, min(growthRevenue) as growthRevenue_min,
      max(growthRevenueSamePeriod) as growthRevenueSamePeriod_max, min(growthRevenueSamePeriod) as growthRevenueSamePeriod_min,
      max(growthProfitBeforeRevenue) as growthProfitBeforeRevenue_max, min(growthProfitBeforeRevenue) as growthProfitBeforeRevenue_min,
      max(growthProfitBeforeRevenueSamePeriod) as growthProfitBeforeRevenueSamePeriod_max, min(growthProfitBeforeRevenueSamePeriod) as growthProfitBeforeRevenueSamePeriod_min,
      max(growthProfitAfterRevenue) as growthProfitAfterRevenue_max, min(growthProfitAfterRevenue) as growthProfitAfterRevenue_min,
      max(growthProfitAfterRevenueSamePeriod) as growthProfitAfterRevenueSamePeriod_max, min(growthProfitAfterRevenueSamePeriod) as growthProfitAfterRevenueSamePeriod_min,
      max(growthEPS) as growthEPS_max, min(growthEPS) as growthEPS_min,
      max(growthEPSSamePeriod) as growthEPSSamePeriod_max, min(growthEPSSamePeriod) as growthEPSSamePeriod_min
    from VISUALIZED_DATA.dbo.filterInvesting
    `
    const data = await this.mssqlService.query(query)
    const dataMapped = KeyFilterResponse.mapToList(data[0])
    await this.redis.set(RedisKeys.minMaxFilter, dataMapped, {ttl: TimeToLive.OneHour})
    return dataMapped
  }
}

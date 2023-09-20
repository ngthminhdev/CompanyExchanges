import { ApiProperty } from "@nestjs/swagger"

export class InvestmentFilterResponse {
    @ApiProperty({
        type: String
    })
    code: string

    @ApiProperty({
        type: String
    })
    floor: string

    @ApiProperty({
        type: String
    })
    LV2: string

    @ApiProperty({
        type: Number,
        description: 'Lợi nhuận sau thuế 4 quý'
    })
    LNST_4_Quarter: number

    @ApiProperty({
        type: Number,
        description: 'Lợi nhuận sau thuế'
    })
    LNST: number

    @ApiProperty({
        type: Number,
        description: 'Vốn chủ sỡ hửu'
    })
    VCSH: number

    @ApiProperty({
        type: Number,
        description: 'Giá'
    })
    closePrice: number

    @ApiProperty({
        type: Number,
        description: 'Tỷ số thanh toán hiện hành (currentRatio)'
    })
    currentRatio: number

    @ApiProperty({
        type: Number,
        description: 'Tỷ số thanh toán nhanh (quickRatio)'
    })
    quickRatio: number

    @ApiProperty({
        type: Number,
        description: 'Tỷ số thanh toán tiền mặt (cashRatio)'
    })
    cashRatio: number

    @ApiProperty({
        type: Number,
        description: 'Tỷ lệ EBIT'
    })
    EBIT: number

    @ApiProperty({
        type: Number,
        description: 'Khả năng thanh toán lãi vay (interestCoverageRatio)'
    })
    interestCoverageRatio: number

    @ApiProperty({
        type: Number,
        description: 'Tỷ lệ đảm bảo trả nợ bằng tài sản (ACR)'
    })
    ACR: number

    @ApiProperty({
        type: Number,
        description: 'Chỉ số khả năng trả nợ (DSCR)'
    })
    DSCR: number

    @ApiProperty({
        type: Number,
        description: 'Tỷ lệ nợ hiện tại trên tổng tài sản (totalDebtToTotalAssets)'
    })
    totalDebtToTotalAssets: number

    @ApiProperty({
        type: Number,
    })
    DE: number

    @ApiProperty({
        type: Number,
        description: 'Vòng quay tài sản cố định (FAT)'
    })
    FAT: number

    @ApiProperty({
        type: Number,
        description: 'Vòng quay tổng tài sản (ATR)'
    })
    ATR: number

    @ApiProperty({
        type: Number,
        description: 'Vòng quay tiền (CTR)'
    })
    CTR: number

    @ApiProperty({
        type: Number,
        description: 'Vòng quay vốn chủ sở hữu (CT)'
    })
    CT: number

    @ApiProperty({
        type: Number,
        description: 'Tỷ suất lợi nhuận gộp biên ( Gross Profit Margin - GPM)'
    })
    GPM: number

    @ApiProperty({
        type: Number,
        description: 'Tỷ suất lợi nhuận ròng ( Net profit margin - NPM)'
    })
    NPM: number

    @ApiProperty({
        type: Number,
        description: 'ROA (Lợi nhuận trên tài sản)'
    })
    ROA: number

    @ApiProperty({
        type: Number,
        description: 'ROE (Lợi nhuận trên vốn chủ sở hữu)'
    })
    ROE: number

    @ApiProperty({
        type: Number,
    })
    grossProfitMargin: number

    @ApiProperty({
        type: Number,
    })
    EBITDAMargin: number

    @ApiProperty({
        type: Number,
    })
    netProfitMargin: number

    @ApiProperty({
        type: Number,
        description: 'PE'
    })
    PE: number

    @ApiProperty({
        type: Number,
        description: 'PB'
    })
    PB: number

    @ApiProperty({
        type: Number,
        description: 'EPS'
    })
    EPS: number

    @ApiProperty({
        type: Number,
        description: 'BVPS'
    })
    BVPS: number

    @ApiProperty({
        type: Number,
        description: 'Vốn hoá'
    })
    marketCap: number

    @ApiProperty({
        type: Number,
        description: 'Shareout'
    })
    shareout: number

    @ApiProperty({
        type: Number,
        description: 'Beta'
    })
    Beta: number

    @ApiProperty({
        type: Number,
        description: 'Tăng trưởng doanh thu'
    })
    growthRevenue: number

    @ApiProperty({
        type: Number,
        description: 'Tăng trưởng doanh thu cùng kỳ'
    })
    growthRevenueSamePeriod: number

    @ApiProperty({
        type: Number,
        description: 'Tăng trưởng lợi nhuận trước thuế'
    })
    growthProfitBeforeRevenue: number

    @ApiProperty({
        type: Number,
        description: 'Tăng trưởng lợi nhuận trước thuế cùng kỳ'
    })
    growthProfitBeforeRevenueSamePeriod: number

    @ApiProperty({
        type: Number,
        description: 'Tăng trưởng lợi nhuận sau thuế'
    })
    growthProfitAfterRevenue: number

    @ApiProperty({
        type: Number,
        description: 'Tăng trưởng lợi nhuận sau thuế cùng kỳ'
    })
    growthProfitAfterRevenueSamePeriod: number

    @ApiProperty({
        type: Number,
        description: 'Tăng trưởng EPS'
    })
    growthEPS: number

    @ApiProperty({
        type: Number,
        description: 'Tăng trưởng EPS cùng kỳ'
    })
    growthEPSSamePeriod: number

    @ApiProperty({
        type: Number,
        description: 'KLGD trung bình 5 phiên'
    })
    totalVol_AVG_5: number

    @ApiProperty({
        type: Number,
        description: 'KLGD trung bình 10 phiên'
    })
    totalVol_AVG_10: number

    @ApiProperty({
        type: Number,
        description: 'KLDG cao nhất 5 phiên'
    })
    totalVol_MAX_5: number

    @ApiProperty({
        type: Number,
        description: 'KLDG cao nhất 10 phiên'
    })
    totalVol_MAX_10: number

    @ApiProperty({
        type: Number,
        description: 'KLGD thấp nhất 5 phiên'
    })
    totalVol_MIN_5: number

    @ApiProperty({
        type: Number,
        description: 'KLGD thấp nhất 10 phiên'
    })
    totalVol_MIN_10: number

    @ApiProperty({
        type: Number,
        description: 'KLGD'
    })
    totalVol: number

    @ApiProperty({
        type: Number,
    })
    rsi: number

    @ApiProperty({
        type: Number,
    })
    ma5: number

    @ApiProperty({
        type: Number,
    })
    ma10: number

    @ApiProperty({
        type: Number,
    })
    ema5: number

    @ApiProperty({
        type: Number,
    })
    ema10: number

    @ApiProperty({
        type: Number,
        description: 'Rating thanh khoản doanh nghiệp'
    })
    liquidity: number

    @ApiProperty({
        type: Number,
        description: 'Rating khả năng thanh toán doanh nghiệp'
    })
    payment: number

    @ApiProperty({
        type: Number,
        description: 'Rating hiệu quả hoạt động doanh nghiệp'
    })
    performance: number

    count: number

    constructor(data?: InvestmentFilterResponse){
        // this.code = data?.code || ''
        // this.floor = data?.floor || ''
        // this.LV2 = data?.LV2 || ''
        // this.LNST_4_Quarter = data?.LNST_4_Quarter || 0
        // this.LNST = data?.LNST || 0
        // this.VCSH = data?.VCSH || 0
        // this.closePrice = data?.closePrice || 0
        // this.currentRatio = data?.currentRatio || 0
        // this.quickRatio = data?.quickRatio || 0
        // this.cashRatio = data?.cashRatio || 0
        // this.EBIT = data?.EBIT || 0
        // this.interestCoverageRatio = data?.interestCoverageRatio || 0
        // this.ACR = data?.ACR || 0
        // this.DSCR = data?.DSCR || 0
        // this.totalDebtToTotalAssets = data?.totalDebtToTotalAssets || 0
        // this.DE = data?.DE || 0
        // this.FAT = data?.FAT || 0
        // this.ATR = data?.ATR || 0
        // this.CTR = data?.CTR || 0
        // this.CT = data?.CT || 0
        // this.GPM = data?.GPM || 0
        // this.NPM = data?.NPM || 0
        // this.ROA = data?.ROA || 0
        // this.ROE = data?.ROE || 0
        // this.grossProfitMargin = data?.grossProfitMargin || 0
        // this.EBITDAMargin = data?.EBITDAMargin || 0
        // this.netProfitMargin = data?.netProfitMargin || 0
        // this.PE = data?.PE || 0
        // this.PB = data?.PB || 0
        // this.EPS = data?.EPS || 0
        // this.BVPS = data?.BVPS || 0
        // this.marketCap = data?.marketCap || 0
        // this.shareout = data?.shareout || 0
        // this.Beta = data?.Beta || 0
        // this.growthRevenue = data?.growthRevenue || 0
        // this.growthRevenueSamePeriod = data?.growthRevenueSamePeriod || 0
        // this.growthProfitBeforeRevenue = data?.growthProfitBeforeRevenue || 0
        // this.growthProfitBeforeRevenueSamePeriod = data?.growthProfitBeforeRevenueSamePeriod || 0
        // this.growthProfitAfterRevenue = data?.growthProfitAfterRevenue || 0
        // this.growthProfitAfterRevenueSamePeriod = data?.growthProfitAfterRevenueSamePeriod || 0
        // this.growthEPS = data?.growthEPS || 0
        // this.growthEPSSamePeriod = data?.growthEPSSamePeriod || 0
        // this.totalVol_AVG_5 = data?.totalVol_AVG_5 || 0
        // this.totalVol_AVG_10 = data?.totalVol_AVG_10 || 0
        // this.totalVol_MAX_5 = data?.totalVol_MAX_5 || 0
        // this.totalVol_MAX_10 = data?.totalVol_MAX_10 || 0
        // this.totalVol_MIN_5 = data?.totalVol_MIN_5 || 0
        // this.totalVol_MIN_10 = data?.totalVol_MIN_10 || 0
        // this.totalVol = data?.totalVol || 0

        // this.rsi = data?.rsi || 0
        // this.ma5 = data?.ma5 || 0
        // this.ma10 = data?.ma10 || 0
        // this.ema5 = data?.ema5 || 0
        // this.ema10 = data?.ema10 || 0
        // this.liquidity = data.liquidity || 0
        // this.performance = data.performance || 0
        // this.payment = data.payment || 0
    }

    static mapToList(data?: InvestmentFilterResponse[]){
         return {
            count: data[0]?.count || 0,
            data
         }
    }
}

export class InvestmentFilterResponseSwagger {
    @ApiProperty({
        type: Number,
        description: 'Số lượng cổ phiếu'
    })
    count: number

    @ApiProperty({
        type: InvestmentFilterResponse,
        isArray: true
    })
    data: InvestmentFilterResponse[]
}


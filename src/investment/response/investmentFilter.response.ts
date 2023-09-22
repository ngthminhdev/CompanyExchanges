import { ApiProperty } from "@nestjs/swagger"

export class InvestmentFilterResponse {
    // @ApiProperty({
    //     type: String
    // })
    // code: string

    // @ApiProperty({
    //     type: String
    // })
    // floor: string

    // @ApiProperty({
    //     type: String
    // })
    // LV2: string

    // @ApiProperty({
    //     type: Number,
    //     description: 'Lợi nhuận sau thuế 4 quý'
    // })
    // LNST_4_Quarter: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'Lợi nhuận sau thuế'
    // })
    // LNST: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'Vốn chủ sỡ hửu'
    // })
    // VCSH: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'Giá'
    // })
    // closePrice: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'Tỷ số thanh toán hiện hành (currentRatio)'
    // })
    // currentRatio: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'Tỷ số thanh toán nhanh (quickRatio)'
    // })
    // quickRatio: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'Tỷ số thanh toán tiền mặt (cashRatio)'
    // })
    // cashRatio: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'Tỷ lệ EBIT'
    // })
    // EBIT: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'Khả năng thanh toán lãi vay (interestCoverageRatio)'
    // })
    // interestCoverageRatio: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'Tỷ lệ đảm bảo trả nợ bằng tài sản (ACR)'
    // })
    // ACR: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'Chỉ số khả năng trả nợ (DSCR)'
    // })
    // DSCR: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'Tỷ lệ nợ hiện tại trên tổng tài sản (totalDebtToTotalAssets)'
    // })
    // totalDebtToTotalAssets: number

    // @ApiProperty({
    //     type: Number,
    // })
    // DE: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'Vòng quay tài sản cố định (FAT)'
    // })
    // FAT: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'Vòng quay tổng tài sản (ATR)'
    // })
    // ATR: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'Vòng quay tiền (CTR)'
    // })
    // CTR: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'Vòng quay vốn chủ sở hữu (CT)'
    // })
    // CT: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'Tỷ suất lợi nhuận gộp biên ( Gross Profit Margin - GPM)'
    // })
    // GPM: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'Tỷ suất lợi nhuận ròng ( Net profit margin - NPM)'
    // })
    // NPM: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'ROA (Lợi nhuận trên tài sản)'
    // })
    // ROA: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'ROE (Lợi nhuận trên vốn chủ sở hữu)'
    // })
    // ROE: number

    // @ApiProperty({
    //     type: Number,
    // })
    // grossProfitMargin: number

    // @ApiProperty({
    //     type: Number,
    // })
    // EBITDAMargin: number

    // @ApiProperty({
    //     type: Number,
    // })
    // netProfitMargin: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'PE'
    // })
    // PE: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'PB'
    // })
    // PB: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'EPS'
    // })
    // EPS: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'BVPS'
    // })
    // BVPS: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'Vốn hoá'
    // })
    // marketCap: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'Shareout'
    // })
    // shareout: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'Beta'
    // })
    // Beta: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'Tăng trưởng doanh thu'
    // })
    // growthRevenue: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'Tăng trưởng doanh thu cùng kỳ'
    // })
    // growthRevenueSamePeriod: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'Tăng trưởng lợi nhuận trước thuế'
    // })
    // growthProfitBeforeRevenue: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'Tăng trưởng lợi nhuận trước thuế cùng kỳ'
    // })
    // growthProfitBeforeRevenueSamePeriod: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'Tăng trưởng lợi nhuận sau thuế'
    // })
    // growthProfitAfterRevenue: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'Tăng trưởng lợi nhuận sau thuế cùng kỳ'
    // })
    // growthProfitAfterRevenueSamePeriod: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'Tăng trưởng EPS'
    // })
    // growthEPS: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'Tăng trưởng EPS cùng kỳ'
    // })
    // growthEPSSamePeriod: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'KLGD trung bình 5 phiên'
    // })
    // totalVol_AVG_5: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'KLGD trung bình 10 phiên'
    // })
    // totalVol_AVG_10: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'KLDG cao nhất 5 phiên'
    // })
    // totalVol_MAX_5: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'KLDG cao nhất 10 phiên'
    // })
    // totalVol_MAX_10: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'KLGD thấp nhất 5 phiên'
    // })
    // totalVol_MIN_5: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'KLGD thấp nhất 10 phiên'
    // })
    // totalVol_MIN_10: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'KLGD'
    // })
    // totalVol: number

    // @ApiProperty({
    //     type: Number,
    // })
    // rsi: number

    // @ApiProperty({
    //     type: Number,
    // })
    // ma5: number

    // @ApiProperty({
    //     type: Number,
    // })
    // ma10: number

    // @ApiProperty({
    //     type: Number,
    // })
    // ema5: number

    // @ApiProperty({
    //     type: Number,
    // })
    // ema10: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'Rating thanh khoản doanh nghiệp'
    // })
    // liquidity: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'Rating khả năng thanh toán doanh nghiệp'
    // })
    // payment: number

    // @ApiProperty({
    //     type: Number,
    //     description: 'Rating hiệu quả hoạt động doanh nghiệp'
    // })
    // performance: number
    code: string
    floor: string
    LV2: string
    closePrice: number
    shareout: number
    marketCap: number
    EPS: number
    BVPS: number
    PE: number
    PB: number
    PS: number
    currentRatio: number
    quickRatio: number
    cashRatio: number
    EBIT: number
    interestCoverageRatio: number
    ACR: number
    DSCR: number
    totalDebtToTotalAssets: number
    DE: number
    FAT: number
    ATR: number
    CTR: number
    CT: number
    GPM: number
    NPM: number
    ROA: number
    ROE: number
    grossProfitMargin: number
    EBITDAMargin: number
    netProfitMargin: number
    EV: number
    EBITDA: number
    EVdivEBITDA: number
    CAR: number
    LTR: number
    LAR_AR: number
    LFR: number
    LLP_NPL: number
    NDR: number
    NPL_TR: number
    NPLR: number
    LAR_TR: number
    LDR: number
    LAR_EAA: number
    DDA_EAA: number
    NPI_AP: number
    NIM: number
    COF: number
    YOEA: number
    ThuNhapLaiThuan: number
    TangTruongLoiNhan: number
    TAISANSINHLAI: number
    growthRevenue: number
    growthRevenueSamePeriod: number
    growthProfitBeforeRevenue: number
    growthProfitBeforeRevenueSamePeriod: number
    growthProfitAfterRevenue: number
    growthProfitAfterRevenueSamePeriod: number
    growthEPS: number
    growthEPSSamePeriod: number
    totalVol_AVG_5: number
    totalVol_AVG_10: number
    totalVol_MAX_5: number
    totalVol_MAX_10: number
    totalVol_MIN_5: number
    totalVol_MIN_10: number
    totalVol: number
    Beta: number
    rsi: number
    rsiStatus: number
    stochK: number
    stochD: number
    stochRsiK: number
    stochRsiD: number
    macd: number
    macd_signal: number
    macdHistogram: number
    adx: number
    williamsR: number
    cci: number
    ma5: number
    ema5: number
    ma10: number
    ema10: number
    ma20: number
    ema20: number
    ma50: number
    ema50: number
    ma100: number
    ema100: number
    ma200: number
    ema200: number
    buySignalBB: number
    sellSignalBB: number
    technicalIndicators: number
    trendLines: number
    technicalOverview: number
    DGACR: number
    DGATR: number
    DGCT: number
    DGCTR: number
    DGDE: number
    DGDSCR: number
    DGFAT: number
    DGGPM: number
    DGNPM: number
    DGROA: number
    DGROE: number
    DGcashRatio: number
    DGcurrentRatio: number
    DGinterestCoverageRatio: number
    DGquickRatio: number
    DGtotalDebtToTotalAssets: number
    liquidity: number
    payment: number
    performance: number
    profitability: number
    basicGeneralReview: number

    count: number

    constructor(data?: InvestmentFilterResponse) {
        this.code = data?.code || ''
        this.floor = data?.floor || ''
        this.LV2 = data?.LV2 || ''
        this.closePrice = data?.closePrice ? data.closePrice / 1000 : 0
        this.shareout = data?.shareout ? data?.shareout / 1000000 : 0
        this.marketCap = data?.marketCap ? data?.marketCap / 1000000000 : 0
        this.EPS = data?.EPS || 0
        this.BVPS = data?.BVPS || 0
        this.PE = data?.PE || 0
        this.PB = data?.PB || 0
        this.PS = data?.PS || 0
        this.currentRatio = data?.currentRatio || 0
        this.quickRatio = data?.quickRatio || 0
        this.cashRatio = data?.cashRatio || 0
        this.EBIT = data?.EBIT ? data?.EBIT / 1000000000 : 0
        this.interestCoverageRatio = data?.interestCoverageRatio || 0
        this.ACR = data?.ACR || 0
        this.DSCR = data?.DSCR || 0
        this.totalDebtToTotalAssets = data?.totalDebtToTotalAssets || 0
        this.DE = data?.DE || 0
        this.FAT = data?.FAT || 0
        this.ATR = data?.ATR || 0
        this.CTR = data?.CTR || 0
        this.CT = data?.CT || 0
        this.GPM = data?.GPM || 0
        this.NPM = data?.NPM || 0
        this.ROA = data?.ROA || 0
        this.ROE = data?.ROE || 0
        this.grossProfitMargin = data?.grossProfitMargin || 0
        this.EBITDAMargin = data?.EBITDAMargin || 0
        this.netProfitMargin = data?.netProfitMargin || 0
        this.EV = data?.EV || 0
        this.EBITDA = data?.EBITDA || 0
        this.EVdivEBITDA = data?.EVdivEBITDA || 0
        this.CAR = data?.CAR || 0
        this.LTR = data?.LTR || 0
        this.LAR_AR = data?.LAR_AR || 0
        this.LFR = data?.LFR || 0
        this.LLP_NPL = data?.LLP_NPL || 0
        this.NDR = data?.NDR || 0
        this.NPL_TR = data?.NPL_TR || 0
        this.NPLR = data?.NPLR || 0
        this.LAR_TR = data?.LAR_TR || 0
        this.LDR = data?.LDR || 0
        this.LAR_EAA = data?.LAR_EAA || 0
        this.DDA_EAA = data?.DDA_EAA || 0
        this.NPI_AP = data?.NPI_AP || 0
        this.NIM = data?.NIM || 0
        this.COF = data?.COF || 0
        this.YOEA = data?.YOEA || 0
        this.ThuNhapLaiThuan = data?.ThuNhapLaiThuan || 0
        this.TangTruongLoiNhan = data?.TangTruongLoiNhan || 0
        this.TAISANSINHLAI = data?.TAISANSINHLAI || 0
        this.growthRevenue = data?.growthRevenue || 0
        this.growthRevenueSamePeriod = data?.growthRevenueSamePeriod || 0
        this.growthProfitBeforeRevenue = data?.growthProfitBeforeRevenue || 0
        this.growthProfitBeforeRevenueSamePeriod = data?.growthProfitBeforeRevenueSamePeriod || 0
        this.growthProfitAfterRevenue = data?.growthProfitAfterRevenue || 0
        this.growthProfitAfterRevenueSamePeriod = data?.growthProfitAfterRevenueSamePeriod || 0
        this.growthEPS = data?.growthEPS || 0
        this.growthEPSSamePeriod = data?.growthEPSSamePeriod || 0
        this.totalVol_AVG_5 = data?.totalVol_AVG_5 ? data?.totalVol_AVG_5 / 1000000 : 0
        this.totalVol_AVG_10 = data?.totalVol_AVG_10 ? data?.totalVol_AVG_10 / 1000000 : 0
        this.totalVol_MAX_5 = data?.totalVol_MAX_5 ? data?.totalVol_MAX_5 / 1000000 : 0
        this.totalVol_MAX_10 = data?.totalVol_MAX_10 ? data?.totalVol_MAX_10 / 1000000 : 0
        this.totalVol_MIN_5 = data?.totalVol_MIN_5 ? data?.totalVol_MIN_5 / 1000000 : 0
        this.totalVol_MIN_10 = data?.totalVol_MIN_10 ? data?.totalVol_MIN_10 / 1000000 : 0
        this.totalVol = data?.totalVol ? data?.totalVol / 1000000 : 0
        this.Beta = data?.Beta || 0
        this.rsi = data?.rsi || 0
        this.rsiStatus = data?.rsiStatus || 0
        this.stochK = data?.stochK || 0
        this.stochD = data?.stochD || 0
        this.stochRsiK = data?.stochRsiK || 0
        this.stochRsiD = data?.stochRsiD || 0
        this.macd = data?.macd || 0
        this.macd_signal = data?.macd_signal || 0
        this.macdHistogram = data?.macdHistogram || 0
        this.adx = data?.adx || 0
        this.williamsR = data?.williamsR || 0
        this.cci = data?.cci || 0
        this.ma5 = data?.ma5 || 0
        this.ema5 = data?.ema5 || 0
        this.ma10 = data?.ma10 || 0
        this.ema10 = data?.ema10 || 0
        this.ma20 = data?.ma20 || 0
        this.ema20 = data?.ema20 || 0
        this.ma50 = data?.ma50 || 0
        this.ema50 = data?.ema50 || 0
        this.ma100 = data?.ma100 || 0
        this.ema100 = data?.ema100 || 0
        this.ma200 = data?.ma200 || 0
        this.ema200 = data?.ema200 || 0
        this.buySignalBB = data?.buySignalBB || 0
        this.sellSignalBB = data?.sellSignalBB || 0
        this.technicalIndicators = data?.technicalIndicators || 0
        this.trendLines = data?.trendLines || 0
        this.technicalOverview = data?.technicalOverview || 0
        this.DGACR = data?.DGACR || 0
        this.DGATR = data?.DGATR || 0
        this.DGCT = data?.DGCT || 0
        this.DGCTR = data?.DGCTR || 0
        this.DGDE = data?.DGDE || 0
        this.DGDSCR = data?.DGDSCR || 0
        this.DGFAT = data?.DGFAT || 0
        this.DGGPM = data?.DGGPM || 0
        this.DGNPM = data?.DGNPM || 0
        this.DGROA = data?.DGROA || 0
        this.DGROE = data?.DGROE || 0
        this.DGcashRatio = data?.DGcashRatio || 0
        this.DGcurrentRatio = data?.DGcurrentRatio || 0
        this.DGinterestCoverageRatio = data?.DGinterestCoverageRatio || 0
        this.DGquickRatio = data?.DGquickRatio || 0
        this.DGtotalDebtToTotalAssets = data?.DGtotalDebtToTotalAssets || 0
        this.liquidity = data?.liquidity || 0
        this.payment = data?.payment || 0
        this.performance = data?.performance || 0
        this.profitability = data?.profitability || 0
        this.basicGeneralReview = data?.basicGeneralReview || 0
    }

    static mapToList(data?: InvestmentFilterResponse[]) {
        return {
            count: data[0]?.count || 0,
            data: data.map(item => new InvestmentFilterResponse(item))
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


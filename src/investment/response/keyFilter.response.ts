import { ApiProperty } from "@nestjs/swagger"

interface KeyFilter {
    MARKETCAP_max: number,
    MARKETCAP_min: number,
    closePrice_max: number,
    closePrice_min: number,
    SHAREOUT_max: number,
    SHAREOUT_min: number,
    PE_max: number,
    PE_min: number,
    PB_max: number,
    PB_min: number,
    EPS_max: number,
    EPS_min: number,
    BVPS_max: number,
    BVPS_min: number,
    EBIT_max: number,
    EBIT_min: number,
    ROA_max: number,
    ROA_min: number,
    ROE_max: number,
    ROE_min: number,
    DSCR_max: number,
    DSCR_min: number,
    totalDebtToTotalAssets_max: number,
    totalDebtToTotalAssets_min: number,
    ACR_max: number,
    ACR_min: number,
    currentRatio_min: number,
    currentRatio_max: number,
    quickRatio_max: number,
    quickRatio_min: number,
    cashRatio_max: number,
    cashRatio_min: number,
    interestCoverageRatio_max: number,
    interestCoverageRatio_min: number,
    FAT_max: number,
    FAT_min: number,
    ATR_max: number,
    ATR_min: number,
    CTR_max: number,
    CTR_min: number,
    CT_max: number,
    CT_min: number,
    totalVol_max: number,
    totalVol_min: number,
    totalVol_AVG_5_max: number,
    totalVol_AVG_5_min: number,
    totalVol_AVG_10_max: number,
    totalVol_AVG_10_min: number,
    totalVol_MIN_5_max: number,
    totalVol_MIN_5_min: number,
    totalVol_MIN_10_max: number,
    totalVol_MIN_10_min: number,
    totalVol_MAX_5_max: number,
    totalVol_MAX_5_min: number,
    totalVol_MAX_10_max: number,
    totalVol_MAX_10_min: number,
    growthRevenue_max: number,
    growthRevenue_min: number,
    growthRevenueSamePeriod_max: number,
    growthRevenueSamePeriod_min: number,
    growthProfitBeforeRevenue_max: number,
    growthProfitBeforeRevenue_min: number,
    growthProfitBeforeRevenueSamePeriod_max: number,
    growthProfitBeforeRevenueSamePeriod_min: number,
    growthProfitAfterRevenue_max: number,
    growthProfitAfterRevenue_min: number,
    growthProfitAfterRevenueSamePeriod_max: number,
    growthProfitAfterRevenueSamePeriod_min: number,
    growthEPS_max: number,
    growthEPS_min: number,
    growthEPSSamePeriod_max: number,
    growthEPSSamePeriod_min: number,
}

export class KeyFilterResponse {
    @ApiProperty({
        type: String
    })
    name: string

    @ApiProperty({
        type: String
    })
    key: string

    @ApiProperty({
        type: Number
    })
    max: number

    @ApiProperty({
        type: Number
    })
    min: number

    static mapToList(data: KeyFilter) {
        return [
            {
                name: 'Vốn hóa (Tỷ VNĐ)',
                key: 'MARKETCAP',
                min: data.MARKETCAP_min,
                max: data.MARKETCAP_max,
            },
            {
                name: 'Thị giá (x1000 vnđ)',
                key: 'closePrice',
                min: data.closePrice_min,
                max: data.closePrice_max,
            },
            {
                name: 'Khối lượng cổ phiếu lưu hành (triệu CP)',
                key: 'SHAREOUT',
                min: data.SHAREOUT_min,
                max: data.SHAREOUT_max,
            },
            {
                name: 'PE',
                key: 'PE',
                min: data.PE_min,
                max: data.PE_max,
            },
            {
                name: 'PB',
                key: 'PB',
                min: data.PB_min,
                max: data.PB_max,
            },
            {
                name: 'EPS',
                key: 'EPS',
                min: data.EPS_min,
                max: data.EPS_max,
            },
            {
                name: 'BVPS',
                key: 'BVPS',
                min: data.BVPS_min,
                max: data.BVPS_max,
            },
            {
                name: 'Tỷ lệ EBIT',
                key: 'EBIT',
                min: data.EBIT_min,
                max: data.EBIT_max,
            },
            {
                name: 'Lợi nhuận trên tài sản (ROA)',
                key: 'ROA',
                min: data.ROA_min,
                max: data.ROA_max,
            },
            {
                name: 'Lợi nhuận trên vốn chủ sở hữu (ROE)',
                key: 'ROE',
                min: data.ROE_min,
                max: data.ROE_max,
            },
            {
                name: 'Chỉ số khả năng trả nợ (DSCR)',
                key: 'DSCR',
                min: data.DSCR_min,
                max: data.DSCR_max,
            },
            {
                name: 'Tỷ lệ nợ hiện tại trên tổng tài sản (totalDebtToTotalAssets)',
                key: 'totalDebtToTotalAssets',
                min: data.totalDebtToTotalAssets_min,
                max: data.totalDebtToTotalAssets_max,
            },
            {
                name: 'Tỷ lệ đảm bảo trả nợ bằng tài sản (ACR)',
                key: 'ACR',
                min: data.ACR_min,
                max: data.ACR_max,
            },
            {
                name: 'Tỷ số thanh toán hiện hành (currentRatio)',
                key: 'quickRatio',
                min: data.currentRatio_min,
                max: data.currentRatio_max,
            },
            {
                name: 'Tỷ số thanh toán nhanh (quickRatio)',
                key: 'quickRatio',
                min: data.quickRatio_min,
                max: data.quickRatio_max,
            },
            {
                name: 'Tỷ số thanh toán tiền mặt (cashRatio)',
                key: 'cashRatio',
                min: data.cashRatio_min,
                max: data.cashRatio_max,
            },
            {
                name: 'Khả năng thanh toán lãi vay (interestCoverageRatio)',
                key: 'interestCoverageRatio',
                min: data.interestCoverageRatio_min,
                max: data.interestCoverageRatio_max,
            },
            {
                name: 'Vòng quay tài sản cố định (FAT)',
                key: 'FAT',
                min: data.FAT_min,
                max: data.FAT_max,
            },
            {
                name: 'Vòng quay tổng tài sản (ATR)',
                key: 'ATR',
                min: data.ATR_min,
                max: data.ATR_max,
            },
            {
                name: 'Vòng quay tiền (CTR)',
                key: 'CTR',
                min: data.CTR_min,
                max: data.CTR_max,
            },
            {
                name: 'Vòng quay vốn chủ sở hữu (CT)',
                key: 'CT',
                min: data.CT_min,
                max: data.CT_max,
            },
            {
                name: 'Tổng KLGD trong phiên',
                key: 'totalVol',
                min: data.totalVol_min,
                max: data.totalVol_max,
            },
            {
                name: 'KLGD trung bình 5 phiên',
                key: 'totalVol_AVG_5',
                min: data.totalVol_AVG_5_min,
                max: data.totalVol_AVG_5_max,
            },
            {
                name: 'KLGD trung bình 10 phiên',
                key: 'totalVol_AVG_10',
                min: data.totalVol_AVG_10_min,
                max: data.totalVol_AVG_10_max,
            },
            {
                name: 'KLGD thấp nhất 5 phiên',
                key: 'totalVol_MIN_10',
                min: data.totalVol_MIN_5_min,
                max: data.totalVol_MIN_5_max,
            },
            {
                name: 'KLGD thấp nhất 10 phiên',
                key: 'totalVol_MIN_10',
                min: data.totalVol_MIN_10_min,
                max: data.totalVol_MIN_10_max,
            },
            {
                name: 'KLGD cao nhất 5 phiên',
                key: 'totalVol_MAX_5',
                min: data.totalVol_MAX_5_min,
                max: data.totalVol_MAX_5_max,
            },
            {
                name: 'KLGD cao nhất 10 phiên',
                key: 'totalVol_MAX_10',
                min: data.totalVol_MAX_10_min,
                max: data.totalVol_MAX_10_max,
            },
            {
                name: 'Tăng trưởng doanh thu quý gần nhất so với cùng kỳ',
                key: 'growthRevenueSamePeriod',
                min: data.growthRevenueSamePeriod_min,
                max: data.growthRevenueSamePeriod_max,
            },
            {
                name: 'Tăng trưởng doanh thu quý gần nhất so với kỳ liền kề',
                key: 'growthRevenue',
                min: data.growthRevenue_min,
                max: data.growthRevenue_max,
            },
            {
                name: 'Tăng trưởng lợi nhuận trước thuế quý gần nhất so với cùng kỳ',
                key: 'growthProfitAfterRevenueSamePeriod',
                min: data.growthProfitAfterRevenueSamePeriod_min,
                max: data.growthProfitAfterRevenueSamePeriod_max,
            },
            {
                name: 'Tăng trưởng lợi nhuận trước thuế quý gần nhất so với kỳ liền kề',
                key: 'growthProfitAfterRevenue',
                min: data.growthProfitAfterRevenue_min,
                max: data.growthProfitAfterRevenue_max,
            },
            {
                name: 'Tăng trưởng EPS quý gần nhất so với cùng kỳ',
                key: 'growthEPSSamePeriod',
                min: data.growthEPSSamePeriod_min,
                max: data.growthEPSSamePeriod_max,
            },
            {
                name: 'Tăng trưởng EPS quý gần nhất so với kỳ liền kề',
                key: 'growthRevenue',
                min: data.growthEPS_min,
                max: data.growthEPS_max,
            },
            {
                name: 'Tăng trưởng lợi nhuận sau thuế quý gần nhất so với cùng kỳ',
                key: 'growthProfitBeforeRevenueSamePeriod',
                min: data.growthProfitBeforeRevenueSamePeriod_min,
                max: data.growthProfitBeforeRevenueSamePeriod_max,
            },
            {
                name: 'Tăng trưởng lợi nhuận sau thuế quý gần nhất so với kỳ liền kề',
                key: 'growthProfitBeforeRevenue',
                min: data.growthProfitBeforeRevenue_min,
                max: data.growthProfitBeforeRevenue_max,
            },
        ]
    }
}
import { UtilCommonTemplate } from "../../utils/utils.common"

export class FinancialHealthRatingResponse {
    name: string
    value: number
    child?: FinancialHealthRatingResponse[]
    constructor(data?: FinancialHealthRatingResponse) {
        this.name = data?.name || ''
        this.value = data?.value || 0
        this.child = data.child || []
    }

    static mapToList(data?: any) {
        const gen: FinancialHealthRatingResponse[] = [
            {
              name: 'Yếu tố thanh khoản',
              value: UtilCommonTemplate.checkStarCommon(data.currentRatio + data.quickRatio + data.cashRatio + data.interestCoverageRatio, 4),
              child: [
                {
                  name: 'Thanh toán hiện hành',
                  value: data.currentRatio
                },
                {
                  name: 'Tỷ số thanh toán nhanh',
                  value: data.quickRatio
                },
                {
                  name: 'Tỷ số thanh toán tiền mặt',
                  value: data.cashRatio
                },
                {
                  name: 'Khả năng thanh toán lãi vay',
                  value: data.interestCoverageRatio
                },
              ]
            },
            {
              name: 'Khả năng thanh toán',
              value: UtilCommonTemplate.checkStarCommon(data.ACR + data.DSCR + data.totalDebtToTotalAssets + data.DE, 4),
              child: [
                {
                  name: 'Tức Tỉ lệ đảm bảo trả nợ bằng tài sản',
                  value: data.ACR
                },
                {
                  name: 'Chỉ số khả năng trả nợ (DSCR)',
                  value: data.DSCR
                },
                {
                  name: 'Tỷ lệ nợ hiện tại trên tổng tài sản',
                  value: data.totalDebtToTotalAssets
                },
                {
                  name: 'Tỷ lệ nợ trên vốn chủ sở hữu',
                  value: data.DE
                },
              ]
            },
            {
              name: 'Hiệu quả hoạt đông',
              value: UtilCommonTemplate.checkStarCommon(data.FAT + data.ATR + data.CTR + data.CT, 4),
              child: [
                {
                  name: 'Vòng quay tài sản cố định (Fixed Asset Turnover Ratio- FAT)',
                  value: data.FAT
                },
                {
                  name: 'Vòng quay tổng tài sản (Asset turnonver Ratio - ATR)',
                  value: data.ATR
                },
                {
                  name: 'Vòng quay tiền (Cash Turnover Ratio - CTR)',
                  value: data.CTR
                },
                {
                  name: 'Vòng quay vốn chủ sở hữu (Capital Turnover- CT)',
                  value: data.CT
                },
              ]
            },
            {
              name: 'Khả năng sinh lời',
              value: UtilCommonTemplate.checkStarCommon(data.GPM + data.NPM + data.ROA + data.ROE, 4),
              child: [
                {
                  name: 'Tỷ suất lợi nhuận gộp biên ( Gross Profit Margin - GPM)',
                  value: data.GPM
                },
                {
                  name: 'Tỷ suất lợi nhuận ròng ( Net profit margin - NPM)',
                  value: data.NPM
                },
                {
                  name: 'ROA (Lợi nhuận trên tài sản)',
                  value: data.ROA
                },
                {
                  name: 'ROE (Lợi nhuận trên vốn chủ sở hữu)Vòng quay vốn chủ sở hữu (Capital Turnover- CT)',
                  value: data.ROE
                },
              ]
            }
          ]
        return {totalStar: UtilCommonTemplate.checkStarCommon(gen.reduce((acc, currentValue) => acc + currentValue.value, 0), 4), data: gen.map((item: FinancialHealthRatingResponse) => new FinancialHealthRatingResponse(item))}
    }
}
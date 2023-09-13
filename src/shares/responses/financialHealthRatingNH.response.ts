import { UtilCommonTemplate } from "../../utils/utils.common"

interface IFinanceHealthNH {
    LFR: number
    LTR: number
    CAR: number
    LAR_AR: number
    NPLR: number
    NDR: number
    LLP_NPL: number
    NPL_TR: number
    LAR_EAA: number
    LAR_TR: number
    DDA_EAA: number
    LDR: number
    NIM: number
    COF: number
    YOEA: number
    NPI_AP: number
}

interface IFinanceHealthAll {
    currentRatio: number,
    quickRatio: number,
    cashRatio: number,
    interestCoverageRatio: number,
    ACR: number,
    DSCR: number,
    totalDebtToTotalAssets: number,
    DE: number,
    FAT: number,
    ATR: number,
    CTR: number,
    CT: number,
    GPM: number,
    NPM: number,
    ROA: number,
    ROE: number 
}

export class FinancialHealthRatingNHResponse {
    static mapToList(star: IFinanceHealthNH, star_industry: IFinanceHealthNH, starAll: IFinanceHealthAll) {
        const data = [
            {
                name: 'Thanh khoản',
                value: UtilCommonTemplate.checkStarCommon(star.LFR + star.LTR + star.CAR + star.LAR_AR, 4),
                child: [
                    {
                        name: 'Dư nợ cho vay khách hàng/Tổng vốn huy động',
                        value: star.LFR
                    },
                    {
                        name: 'Dư nợ cho vay khách hàng/Tổng tài sản',
                        value: star.LTR
                    },
                    {
                        name: 'Vốn chủ sở hữu/Tổng tài sản',
                        value: star.CAR
                    },
                    {
                        name: 'Tài sản thanh khoản/Nợ phải trả',
                        value: star.LAR_AR
                    },
                ]
            },
            {
                name: 'Chất lượng tín dụng',
                value: UtilCommonTemplate.checkStarCommon(star.NPLR + star.NDR + star.LLP_NPL + star.NPL_TR, 4),
                child: [
                    {
                        name: 'Tỷ lệ nợ xấu',
                        value: star.NPLR
                    },
                    {
                        name: 'Tỷ lệ xóa nợ',
                        value: star.NDR
                    },
                    {
                        name: 'Dự phòng/Nợ xấu',
                        value: star.LLP_NPL
                    },
                    {
                        name: 'Nợ xấu/Tổng tài sản',
                        value: star.NPL_TR
                    },
                ]
            },
            {
                name: 'Cơ cấu tài sản',
                value: UtilCommonTemplate.checkStarCommon(star.LAR_EAA + star.LAR_TR + star.DDA_EAA + star.LDR, 4),
                child: [
                    {
                        name: 'Cho vay/Tài sản sinh lãi',
                        value: star.LAR_EAA
                    },
                    {
                        name: 'Cho vay/Tổng tài sản',
                        value: star.LAR_TR
                    },
                    {
                        name: 'Tiền gửi KH/Tài sản sinh lãi',
                        value: star.DDA_EAA
                    },
                    {
                        name: 'Cho vay/Tiền gửi khách hàng',
                        value: star.LDR
                    },
                ]
            },
            {
                name: 'Khả năng sinh lời',
                value: UtilCommonTemplate.checkStarCommon(star.NIM + star.COF + star.YOEA + star.NPI_AP, 4),
                child: [
                    {
                        name: 'Tỷ lệ thu nhập lãi thuần (NIM)',
                        value: star.NIM
                    },
                    {
                        name: 'Tỷ lệ chi phí hình thành Tài sản Có sinh lãi (COF)',
                        value: star.COF
                    },
                    {
                        name: 'Tỷ suất sinh lợi của Tài sản Có sinh lãi (YOEA)',
                        value: star.YOEA
                    },
                    {
                        name: 'Lợi nhuận sau thuế/Thu nhập hoạt động',
                        value: star.NPI_AP
                    },
                ]
            }
        ]
        return {
            totalStar: UtilCommonTemplate.checkStarCommon(data.reduce((acc, cur) => acc += cur.value, 0), 4),
            totalStarIndustry: UtilCommonTemplate.checkStarCommon(
                UtilCommonTemplate.checkStarCommon(
                    star_industry.LFR +
                    star_industry.LTR +
                    star_industry.CAR +
                    star_industry.LAR_AR, 4
                ) + 
                UtilCommonTemplate.checkStarCommon(
                    star_industry.NPLR +
                    star_industry.NDR +
                    star_industry.LLP_NPL +
                    star_industry.NPL_TR, 4
                ) + 
                UtilCommonTemplate.checkStarCommon(
                    star_industry.LAR_EAA +
                    star_industry.LAR_TR +
                    star_industry.DDA_EAA +
                    star_industry.LDR, 4
                ) + 
                UtilCommonTemplate.checkStarCommon(
                    star_industry.NIM +
                    star_industry.COF +
                    star_industry.YOEA +
                    star_industry.NPI_AP, 4
                ), 4
            ),
            totalStarAll: UtilCommonTemplate.checkStarCommon(
                UtilCommonTemplate.checkStarCommon(
                    starAll.currentRatio +
                    starAll.quickRatio +
                    starAll.cashRatio +
                    starAll.interestCoverageRatio, 4
                ) + 
                UtilCommonTemplate.checkStarCommon(
                    starAll.ACR +
                    starAll.DSCR +
                    starAll.totalDebtToTotalAssets +
                    starAll.DE, 4
                ) + 
                UtilCommonTemplate.checkStarCommon(
                    starAll.FAT +
                    starAll.ATR +
                    starAll.CTR +
                    starAll.CT, 4
                ) + 
                UtilCommonTemplate.checkStarCommon(
                    starAll.GPM +
                    starAll.NPM +
                    starAll.ROA +
                    starAll.ROE, 4
                ), 4
            ),
            data
        }
    }
}

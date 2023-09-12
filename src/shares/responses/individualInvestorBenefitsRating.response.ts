import { UtilCommonTemplate } from "../../utils/utils.common"

export class IndividualInvestorBenefitsRatingResponse {

    static mapToList(
        month_6: number, year_1: number, year_2: number, year_4: number, co_tuc: number, ty_le_co_tuc: number,
        month_6_industry: number, year_1_industry: number, year_2_industry: number, year_4_industry: number, co_tuc_industry: number, ty_le_co_tuc_industry: number,
        month_6_all: number, year_1_all: number, year_2_all: number, year_4_all: number, co_tuc_all: number, ty_le_co_tuc_all: number
        ) {
        const data = [
            {
                name: 'Tăng trưởng thị giá cổ phiếu',
                value: UtilCommonTemplate.checkStarCommonV2(month_6 + year_1 + year_2 + year_4, 4),
                child: [
                    {
                        name: 'Tăng trưởng giá qua 6 tháng',
                        value: month_6
                    },
                    {
                        name: 'Tăng trưởng giá qua 1 năm',
                        value: year_1
                    },
                    {
                        name: 'Tăng trưởng giá qua 2 năm',
                        value: year_2
                    },
                    {
                        name: 'Tăng trưởng giá qua 4 năm',
                        value: year_4
                    },
                ]
            },
            {
                name: 'Cổ tức tiền mặt',
                value: UtilCommonTemplate.checkStarCommon(co_tuc + ty_le_co_tuc, 2),
                child: [
                    {
                        name: 'Cổ tức tiền mặt ổn định',
                        value: co_tuc
                    },
                    {
                        name: 'Tỷ lệ cổ tức tiền mặt tốt',
                        value: ty_le_co_tuc
                    }
                ]
            },

        ]
        const totalStar = UtilCommonTemplate.checkStarCommon(data.reduce((acc, currentValue) => acc + currentValue.value, 0), 2)
        const totalStarIndustry = UtilCommonTemplate.checkStarCommon(
            UtilCommonTemplate.checkStarCommonV2(month_6_industry + year_1_industry + year_2_industry + year_4_industry, 4) + 
            UtilCommonTemplate.checkStarCommon(co_tuc_industry + ty_le_co_tuc_industry, 2), 2
        )
        const totalStarAll = UtilCommonTemplate.checkStarCommon(
            UtilCommonTemplate.checkStarCommonV2(month_6_all + year_1_all + year_2_all + year_4_all, 4) + 
            UtilCommonTemplate.checkStarCommon(co_tuc_all + ty_le_co_tuc_all, 2), 2
        )
        return {
            totalStar, totalStarIndustry, totalStarAll, data
        }
    }
}
import { UtilCommonTemplate } from "../../utils/utils.common"

export class IndividualInvestorBenefitsRatingResponse {

    static mapToList(month_6: number, year_1: number, year_2: number, year_4: number, co_tuc: number, ty_le_co_tuc: number) {
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
        return {
            totalStar, data
        }
    }
}
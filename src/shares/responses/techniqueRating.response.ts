import { ApiProperty } from "@nestjs/swagger"
import { UtilCommonTemplate } from "../../utils/utils.common"

export class TechniqueRatingResponse {
    @ApiProperty({
        type: String,
        example: 'Định giá'
    })
    name: string

    @ApiProperty({
        type: Number,
        example: 1
    })
    value: number

    @ApiProperty({
        type: [TechniqueRatingResponse],
        example: [{
            name: 'Định giá',
            value: 2,
        }],
        isArray: true
    })
    child: TechniqueRatingResponse[]

    constructor(data?: TechniqueRatingResponse) {
        this.name = data?.name || ''
        this.value = data?.value || 0
        this.child = data?.child ? TechniqueRatingResponse.mapToList(data.child) : []
        switch (data?.name) {
            case 'dinh_gia_pe':
                this.name = 'Định giá trên cổ tức'
                break
            case 'dinh_gia_pb':
                this.name = 'Định giá trên giá trị sổ sách'
                break
            default:
                break;
        }
    }

    static mapToList(data: any[], starIndustry?: number, starAll?: number): any {
        const dataMapped = data.map(item => new TechniqueRatingResponse(item))
        const totalStar = UtilCommonTemplate.checkStarCommon(dataMapped.reduce((acc, currentValue) => acc + currentValue.value, 0), 2)
        return {
            totalStarIndustry: starIndustry, totalStarAll: starAll, totalStar, data: dataMapped
        }
    }
}
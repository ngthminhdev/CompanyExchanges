import { ApiProperty } from "@nestjs/swagger"
import { UtilCommonTemplate } from "../../utils/utils.common"

export class ValuationRatingResponse {
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
        type: [ValuationRatingResponse],
        example: [{
            name: 'Định giá',
            value: 2,
        }],
        isArray: true
    })
    child: ValuationRatingResponse[]

    constructor(data?: ValuationRatingResponse) {
        this.name = data?.name || ''
        this.value = data?.value || 0
        this.child = data?.child || []
        switch (data?.name) {
            case 'graham':
                this.name = 'Định giá Graham'
                break;
            case 'graham_1':
                this.name = 'Định giá Graham 1'
                break;
            case 'graham_2':
                this.name = 'Định giá Graham 2'
                break;
            case 'graham_3':
                this.name = 'Định giá Graham 3'
                break;
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

    static mapToList(data: any[], data_2: any[], data_3: any[]): any {
        const dataMapped = data.map(item => new ValuationRatingResponse(item))
        const totalStar = UtilCommonTemplate.checkStarCommon(dataMapped.reduce((acc, currentValue) => acc + currentValue.value, 0), 3)
        const totalStarIndustry = UtilCommonTemplate.checkStarCommon(data_2.reduce((acc, currentValue) => acc + currentValue.value, 0), 3)
        const totalStarAll = UtilCommonTemplate.checkStarCommon(data_3.reduce((acc, currentValue) => acc + currentValue.value, 0), 3)
        return {
            totalStar, totalStarIndustry, totalStarAll, data: dataMapped
        }
    }
}
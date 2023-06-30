import { ApiProperty } from "@nestjs/swagger"
import { TimeTypeEnum } from "../../enums/common.enum"
import { UtilCommonTemplate } from "../../utils/utils.common"
import { BaseResponse } from "../../utils/utils.response"

export class RetailValueResponse {
    @ApiProperty({
        type: String,
    })
    name: string

    @ApiProperty({
        type: String,
    })
    date: string

    @ApiProperty({
        type: String,
    })
    year: string

    @ApiProperty({
        type: Number,
    })
    value: number

    @ApiProperty({
        type: Number,
    })
    order: number

    @ApiProperty({
        type: String,
    })
    color: string

    constructor(data: RetailValueResponse) {
        this.name = data?.name == 'Tong' ? 'Tổng' : data.name
        this.value = data?.value || 0
        switch (data?.order) {
            case TimeTypeEnum.Month:
                this.date = data?.date ? UtilCommonTemplate.toDate(data.date) : ''
                break;
            case TimeTypeEnum.Quarter: 
                this.date = data?.date ? `${data?.year}${data?.date}` : ''
                break
            case TimeTypeEnum.Year:
                this.date = data?.date.toString() || ''  
                break
            default:
                break;
        }
        switch (data?.name) {
            case 'Bán lẻ: Du lịch (Tỷ VNĐ)':
                this.color = '#BE0AFF'
                break;
            case 'Bán lẻ: Dịch vụ (Tỷ VNĐ)':
                this.color = '#147DF5'
                break;
            case 'Bán lẻ: Khách sạn nhà hàng (Tỷ VNĐ)':
                this.color = '#00BF63'
                break;
            case 'Bán lẻ: Thương nghiệp (Tỷ VNĐ)':
                this.color = '#FF6699'
                break;
            default:
                this.color = ''
                break;
        }
    }

    static mapToList(data: RetailValueResponse[], order: number) {
        return data.map(item => new RetailValueResponse({...item, order}))
    }
}

export class RetailValueSwagger extends BaseResponse {
    @ApiProperty({
        type: RetailValueResponse,
        isArray: true
    })
    data: RetailValueResponse[]
}
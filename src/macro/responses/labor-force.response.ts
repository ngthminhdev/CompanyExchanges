import { ApiProperty } from "@nestjs/swagger"
import { UtilCommonTemplate } from "../../utils/utils.common"

export class LaborForceResponse {
    @ApiProperty({
        type: String
    })
    name: string

    @ApiProperty({
        type: String
    })
    date: string

    @ApiProperty({
        type: Number
    })
    value: number

    @ApiProperty({
        type: String
    })
    color: string

    constructor(data?: LaborForceResponse) {
        this.name = data?.name || ''
        this.date = data?.date ? UtilCommonTemplate.toDate(data?.date) : ''
        this.value = data?.value || 0
        switch (data?.name) {
            case 'Lực lượng lao động ( triệu người)':
                this.color = '#2CC8DD'
                break;
            case 'Lao động có việc ( triệu người)':
                this.color = '#3CD8C5'
                break;
            case 'Tỷ lệ chung':
                this.color = '#6CE5E8'
                break;
            case 'Thanh niên':
                this.color = '#41B8D5'
                break;
            case 'Thanh niên thành thị':
                this.color = '#2D8BBA'
                break;
            default:
                break;
        }
    }

    static mapToList(data?: LaborForceResponse[]) {
        return data.map(item => new LaborForceResponse(item))
    }
}
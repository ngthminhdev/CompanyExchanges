import { ApiProperty } from "@nestjs/swagger"

export class SearchStockResponse {
    @ApiProperty({
        type: String
    })
    code: string

    @ApiProperty({
        type: String
    })
    company_name: string

    @ApiProperty({
        type: String
    })
    type: string

    @ApiProperty({
        type: String
    })
    image: string

    @ApiProperty({
        type: String
    })
    floor: string

    @ApiProperty({
        type: String
    })
    short_name: string

    constructor(data?: SearchStockResponse) {
        this.code = data?.code || ''
        this.company_name = data?.company_name || ''
        this.short_name = data?.short_name || ''
        this.floor = data?.floor || ''
        switch (data?.type) {
            case 'Ngân hàng':
                this.type = 'NH'
                break;
            case 'Bảo hiểm':
                this.type = 'BH'
                break;
            case 'Dịch vụ tài chính':
                this.type = 'CK'
                break;
            default:
                this.type = 'CTCP'
                break;
        }
        this.image = `/resources/stock/${data?.code}_${data?.floor}.jpg`
    }

    static mapToList(data?: SearchStockResponse[]) {
        return data.map(item => new SearchStockResponse(item))
    }
}
import { ApiProperty } from "@nestjs/swagger"

export class BusinessResultsResponse {
    @ApiProperty({
        type: String
    })
    name: string

    @ApiProperty({
        type: Number
    })
    value: number

    @ApiProperty({
        type: String
    })
    date: string

    constructor(data?: BusinessResultsResponse) {
        switch (data?.name) {
            case 'LỢI NHUẬN KẾ TOÁN SAU THUẾ TNDN':
                this.name = 'Lợi nhuận kế toán sau thuế TNDN'
                break;
            case 'KẾT QUẢ HOẠT ĐỘNG':
                this.name = 'Kết quả hoạt động'
                break
            default:
                this.name = data?.name && data.name.indexOf('(') != -1 ? data.name.slice(0, data.name.indexOf('(')).trim() : data?.name
                break;
        }
        this.value = data?.value || 0
        this.date = data?.date || ''
    }

    static mapToList(data?: BusinessResultsResponse[]) {
        return data.map(item => new BusinessResultsResponse(item))
    }
}
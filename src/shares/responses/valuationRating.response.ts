import { ApiProperty } from "@nestjs/swagger"

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
        this.child = data?.child ? ValuationRatingResponse.mapToList(data.child) : []
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

    static mapToList(data?: ValuationRatingResponse[]) {
        return data.map(item => new ValuationRatingResponse(item))
    }
}
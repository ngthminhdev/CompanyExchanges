import { ApiProperty } from "@nestjs/swagger"

export class FinancialIndicatorsResponse {
    // @ApiProperty({
    //     type: Number
    // })
    // eps: number

    // @ApiProperty({
    //     type: Number
    // })
    // bvps: number

    // @ApiProperty({
    //     type: Number
    // })
    // pe: number

    // @ApiProperty({
    //     type: Number
    // })
    // roe: number

    // @ApiProperty({
    //     type: Number
    // })
    // roa: number

    // @ApiProperty({
    //     type: String
    // })
    // date: string

    // constructor(data?: FinancialIndicatorsResponse){
    //     this.eps = data?.eps || 0
    //     this.bvps = data?.bvps || 0
    //     this.pe = data?.pe || 0
    //     this.roe = data?.roe || 0
    //     this.roa = data?.roa || 0
    //     this.date = data?.date || ''
    // }

    value: number
    name: string
    date: string

    constructor(data?: FinancialIndicatorsResponse) {
        this.value = data?.value || 0
        switch (data?.name) {
            case 'EPS':
                this.name = 'EPS của 4 quý gần nhất'
                break;
                case 'BVPS':
                    this.name = 'BVPS cơ bản'
                    break;
                    case 'PE':
                this.name = 'P/E cơ bản'
                break;
            default:
                this.name = data?.name || ''
                break;
        }
        this.date = data?.date || ''
    }

    static mapToList(data?: FinancialIndicatorsResponse[]) {
        return data.map(item => new FinancialIndicatorsResponse(item))
    }
}
import { ApiProperty } from "@nestjs/swagger"
import { UtilCommonTemplate } from "../../utils/utils.common"

export class ExchangeRateAndInterestRateResponse {
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

    constructor(data?: ExchangeRateAndInterestRateResponse) {
        this.name = data?.name || ''
        switch (data?.name) {
            case 'Lai suat':
                this.name = 'Lãi suất'
                this.color = '#9B57CC'
                break;
            case 'Ty gia':
                this.name = 'Tỷ giá'
                this.color = '#65A6FA'
                break;
            case 'VNINDEX':
                this.name = 'VN-Index'
                this.color = '#00CADC'
                break;
            default:
                break;
        }
        this.date = data?.date ? UtilCommonTemplate.toDate(data.date) : ''
        this.value = data?.value || 0
    }


    static mapToList(data?: ExchangeRateAndInterestRateResponse[]) {
        return data.map(item => new ExchangeRateAndInterestRateResponse(item))
    }
}
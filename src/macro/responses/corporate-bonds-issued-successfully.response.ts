import { ApiProperty } from "@nestjs/swagger"
import * as moment from "moment"

export class CorporateBondsIssuedSuccessfullyResponse {
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

    @ApiProperty({
        type: String
    })
    color: string

    month: string
    year: string

    constructor(data?: CorporateBondsIssuedSuccessfullyResponse) {
        this.name = data?.name || 'Khác'
        this.value = data?.value || 0
        this.date = data?.year ? moment(`${data.year}-${data?.month}-01`, 'YYYY-MM-DD').format('YYYY/MM/DD') : data.date
        switch (data?.name) {
            case 'Bất động sản & Xây dựng':
                this.color = '#0AEFFF'
                break;
            case 'Tài chính':
                this.color = '#38B6FF'
                break;
                case 'DN':
                    this.color = '#2CC8DD'
                    break;    
            default:
                this.color = '#147DF5'
                break;
        }
    }

    static mapToList(data?: CorporateBondsIssuedSuccessfullyResponse[]) {
        return data.map(item => new CorporateBondsIssuedSuccessfullyResponse(item))
    }
}
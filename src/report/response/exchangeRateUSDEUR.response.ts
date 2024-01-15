import { ApiProperty } from "@nestjs/swagger"
import { UtilCommonTemplate } from "../../utils/utils.common"

export class ExchangeRateUSDEURResponse {
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

    constructor(data?: ExchangeRateUSDEURResponse){
        this.name = data?.name || ''
        this.value = data?.value || 0
        this.date = data?.date ? UtilCommonTemplate.toDate(data?.date) : ''
    }

    static mapToList(data?: ExchangeRateUSDEURResponse[]){
         const dataMapped = data.map(item => new ExchangeRateUSDEURResponse(item))
         return {
            data_0: dataMapped.filter(item => item.name.includes('Dầu Brent') || item.name.includes('Khí Gas')),
            data_1: dataMapped.filter(item => item.name.includes('Đồng') || item.name.includes('Vàng')),
            data_2: dataMapped.filter(item => item.name.includes('Thép HRC') || item.name.includes('Thép')),
            data_3: dataMapped.filter(item => item.name.includes('Bông') || item.name.includes('Đường')),
            data_4: dataMapped.filter(item => item.name.includes('Cao su') || item.name.includes('Ure')),
            data_5: dataMapped.filter(item => item.name.includes('Dollar Index') || item.name.includes('U.S.10Y'))
         }
    }
}
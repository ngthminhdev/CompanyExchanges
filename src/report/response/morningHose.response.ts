import { ApiProperty } from "@nestjs/swagger"

export class ITop {
    @ApiProperty({
        type: String
    })
    code: string

    @ApiProperty({
        type: Number
    })
    netVal: number
}

export class MorningHoseResponse {
    @ApiProperty({
        type: Number,
        description: 'Độ rộng màu vàng'
    })
    noChange: number

    @ApiProperty({
        type: Number,
        description: 'Độ rộng màu đỏ'
    })
    decline: number

    @ApiProperty({
        type: Number,
        description: 'Độ rộng màu xanh'
    })
    advance: number

    @ApiProperty({
        type: Number,
        description: 'Khối ngoại (nếu số dương thì để mua, âm thì để bán)'
    })
    netVal: number

    @ApiProperty({
        type: ITop,
        isArray: true,
        description: 'Bán ròng mạnh'
    })
    sell: ITop[]

    @ApiProperty({
        type: ITop,
        isArray: true,
        description: 'Mua ròng mạnh'
    })
    buy: ITop[]

    constructor(data: MorningHoseResponse){
        this.noChange = data?.noChange || 0
        this.decline = data?.decline || 0
        this.advance = data?.advance || 0
        this.netVal = data?.netVal || 0
        this.sell = data?.sell || []
        this.buy = data?.buy || []
    }
}


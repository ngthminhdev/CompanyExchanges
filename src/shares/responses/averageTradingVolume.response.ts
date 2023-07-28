import { ApiProperty } from "@nestjs/swagger"

export class AverageTradingVolumeResponse {
    @ApiProperty({
        type: Number
    })
    week: number

    @ApiProperty({
        type: Number
    })
    month: number

    @ApiProperty({
        type: Number
    })
    quarter: number

    @ApiProperty({
        type: Number
    })
    year: number

    @ApiProperty({
        type: Number
    })
    min: number

    @ApiProperty({
        type: Number
    })
    max: number
    
    constructor(data?: AverageTradingVolumeResponse) {
        this.week = data?.week || 0
        this.month = data?.month || 0
        this.quarter = data?.quarter || 0
        this.year = data?.year || 0
        this.min = data?.min || 0
        this.max = data?.max || 0
    }
}
import { ApiProperty } from "@nestjs/swagger"

class InvestmentFilterBodyDto {
    @ApiProperty({
        type: String
    })
    key: string

    @ApiProperty({
        type: Number
    })
    from: number

    @ApiProperty({
        type: Number
    })
    to: number
}

export class InvestmentFilterDto {
    @ApiProperty({
        type: InvestmentFilterBodyDto,
        isArray: true
    })
    filter: InvestmentFilterBodyDto[]

    @ApiProperty({
        type: Number
    })
    limit: number

    @ApiProperty({
        type: Number
    })
    page: number

    @ApiProperty({
        type: String
    })
    exchange: string
}

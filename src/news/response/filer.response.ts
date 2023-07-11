import { ApiProperty } from "@nestjs/swagger"

class FilterV4Response {
    @ApiProperty({
        type: String
    })
    name: string

    @ApiProperty({
        type: String,
        isArray: true
    })
    code: string[]
}

class FilterV2Response {
    @ApiProperty({
        type: String
    })
    name: string

    @ApiProperty({
        type: FilterV4Response,
        isArray: true
    })
    LV4: FilterV4Response[]
}

export class FilterResponse {
    @ApiProperty({
        type: String
    })
    name: string

    @ApiProperty({
        type: FilterV2Response,
        isArray: true
    })
    LV2: FilterV2Response[]
}

export class InfoStockResponse {
    @ApiProperty({
        type: String
    })
    name: string

    @ApiProperty({
        type: String
    })
    company_name: string

    @ApiProperty({
        type: String
    })
    short_name: string

    @ApiProperty({
        type: String
    })
    code: string

}
import { ApiProperty } from "@nestjs/swagger";

export class SaveMarketMovementsDto {
    @ApiProperty({
        type: String
    })
    text: string
}

export class SaveMarketCommentDto {
    @ApiProperty({
        type: String,
        isArray: true
    })
    text: string[]

    @ApiProperty({
        type: String,
    })
    img: string
}
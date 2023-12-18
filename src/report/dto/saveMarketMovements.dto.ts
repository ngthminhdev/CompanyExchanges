import { ApiProperty } from "@nestjs/swagger";

export class SaveMarketMovementsDto {
    @ApiProperty({
        type: String
    })
    text: string
}
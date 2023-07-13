import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { PageLimitDto } from "./page-limit.dto";

export class EventDto extends PageLimitDto {
    @IsString()
    @ApiProperty({
        type: String
    })
    exchange: string

    @ApiProperty({
        type: Number,
        description: `0 - Tất cả, 1 - Trả cổ tức bằng tiền mặt, 2 - Trả cổ tức bằng cổ phiếu, 3 - Thưởng cổ phiếu, 4 - Phát hành thêm`
    })
    type: string
}
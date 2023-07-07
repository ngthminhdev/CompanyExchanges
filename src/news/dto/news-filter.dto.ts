import { ApiProperty } from "@nestjs/swagger";
import { PageLimitDto } from "./page-limit.dto";

export class NewsFilterDto extends PageLimitDto {
    @ApiProperty({
        type: String,
        example: 'VCB,ICD'
    })
    code: string
}
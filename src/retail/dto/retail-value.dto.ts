import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";

export class RetailValueDto {
    @IsEnum(['0', '1', '2'], {message: 'order not found'})
    @ApiProperty({
        type: Number,
        example: '0',
        description: '0 - Quý, 1 - Năm, 2 - Tháng'
    })
    order: string
}
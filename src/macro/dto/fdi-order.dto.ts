import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";

export class FDIOrderDto {
    @IsEnum(['0', '2'], { message: 'order not found' })
    @ApiProperty({
        type: Number,
        description: `0 - Quý, 2 - Tháng`
    })
    order: string
}
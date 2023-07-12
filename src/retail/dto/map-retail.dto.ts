import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class MapExportImportDto {
    @IsNotEmpty()
    @ApiProperty({
        type: Number,
        description: '0 - Tháng gần nhất, 1 - 3 thánh gần nhất, 2 - Từ đầu năm, 3 - Qua một năm'
    })
    order: number
}
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsInt, IsNotEmpty, IsNumber } from "class-validator";

export class IndustrialIndexDto {
    @IsEnum(['0', '1', '2', '3', '4'], {message: 'industry invalid'})
    @ApiProperty({
        type: Number,
        description: `0 - Toàn ngành công nghiệp
                      1 - Sản xuất và Phân phối điện      
                      2 - Khai khoáng
                      3 - Cung cấp nước, hoạt động quản lý và xử lý rác thải, nước thải
                      4 - Công nghiệp chế biến, chế tạo
        `
    })
    industry: string
}
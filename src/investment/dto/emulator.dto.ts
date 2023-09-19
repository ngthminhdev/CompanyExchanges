import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

class CategoryEmulatorInvestment {
    @ApiProperty({
        type: String,
        description: 'Mã cổ phiếu'
    })
    code: string

    @ApiProperty({
        type: Number,
        description: 'Số phần trăm',
        example: 20
    })
    category_1: number

    @ApiProperty({
        type: Number,
        description: 'Số phần trăm',
        example: 20
    })
    category_2: number

    @ApiProperty({
        type: Number,
        description: 'Số phần trăm',
        example: 20
    })
    category_3: number
}

export class EmulatorInvestmentDto {
    @IsNotEmpty()
    @ApiProperty({
        type: Number,
        description: 'Vốn đầu tư ban đầu (Tr)'
    })
    value: number

    @IsNotEmpty()
    @ApiProperty({
        type: String,
        description: 'Từ tháng',
        example: '7/2023'
    })
    from: string

    @IsNotEmpty()
    @ApiProperty({
        type: String,
        description: 'Đến tháng',
        example: '9/2023'
    })
    to: string

    @ApiProperty({
        type: Number,
        description: 'Có tick đầu tư định kì hay không (0 - Không có, 1 - Có)',
        example: 1
    })
    isPeriodic: number

    @ApiProperty({
        type: Number,
        description: 'Kỳ hạn (0 - Tháng, 1 - Quý, 2 - Năm)',
        example: 1
    })
    period: number

    @ApiProperty({
        type: Number,
        description: 'Giá trị thêm định kỳ (Tr)',
        example: 1000
    })
    value_period: number

    @ApiProperty({
        type: CategoryEmulatorInvestment,
        isArray: true
    })
    category: CategoryEmulatorInvestment[]
}


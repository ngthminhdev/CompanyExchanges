import { ApiProperty } from "@nestjs/swagger"
import { TimeTypeEnum } from "../../enums/common.enum"
import { UtilCommonTemplate } from "../../utils/utils.common"
import { BaseResponse } from "../../utils/utils.response"

export class RetailValueResponse {
    @ApiProperty({
        type: String,
    })
    name: string

    @ApiProperty({
        type: String,
    })
    date: string

    @ApiProperty({
        type: String,
    })
    year: string

    @ApiProperty({
        type: Number,
    })
    value: number

    @ApiProperty({
        type: Number,
    })
    order: number

    @ApiProperty({
        type: String,
    })
    color: string

    constructor(data: RetailValueResponse) {
        this.name = data?.name == 'Tong' ? 'Tổng' : data.name
        this.value = data?.value ?? data?.value | 0
        switch (data?.order) {
            case TimeTypeEnum.Month:
                this.date = data?.date ? UtilCommonTemplate.toDate(data.date) : ''
                break;
            case TimeTypeEnum.Quarter:
                this.date = data?.date || ''
                break
            case TimeTypeEnum.Year:
                this.date = data?.date.toString() || ''
                break
            default:
                break;
        }
        switch (data?.name) {
            case 'Bán lẻ: Du lịch (Tỷ VNĐ)':
                this.color = '#BE0AFF'
                break;
            case 'Bán lẻ: Dịch vụ (Tỷ VNĐ)':
                this.color = '#147DF5'
                break;
            case 'Bán lẻ: Khách sạn nhà hàng (Tỷ VNĐ)':
                this.color = '#00BF63'
                break;
            case 'Bán lẻ: Thương nghiệp (Tỷ VNĐ)':
                this.color = '#FF6699'
                break;
            case 'Nhập khẩu: Tổng trị giá Nhập khẩu (triệu USD)':
                this.color = '#E7C64F'
                break;
            case 'Xuất khẩu: Tổng trị giá Xuất khẩu (triệu USD)':
                this.color = '#147DF5'
                break;
            case 'Xuất khẩu: Điện tử máy tính (triệu USD)':
                this.color = '#FF6699'
                break;
            case 'Xuất khẩu: Máy móc thiết bị (triệu USD)':
                this.color = '#FF0000'
                break;
            case 'Xuất khẩu: Dệt may (triệu USD)':
                this.color = '#FF8700'
                break;
            case 'Xuất khẩu: Giày da (triệu USD)':
                this.color = '#FFD300'
                break;
            case 'Xuất khẩu: Gỗ và sản phẩm gỗ (triệu USD)':
                this.color = '#0AFF99'
                break;
            case 'Xuất khẩu: Thủy sản (triệu USD)':
                this.color = '#0AEFFF'
                break;
            case 'Xuất khẩu: Gạo (triệu USD)':
                this.color = '#147DF5'
                break;
            case 'Xuất khẩu: Café (triệu USD)':
                this.color = '#0077B6'
                break;
            case 'Xuất khẩu: Dầu thô (triệu USD)':
                this.color = '#FFB337'
                break;

            case 'Nhập khẩu: Điện tử, máy tính và linh kiện (triệu USD)':
                this.color = '#FF6699'
                break;

            case 'Nhập khẩu: Máy móc thiết bị, phụ tùng (triệu USD)':
                this.color = '#FF0000'
                break;
            case 'Nhập khẩu: Sắt thép (triệu USD)':
                this.color = '#FF8700'
                break;
            case 'Nhập khẩu: Vải (triệu USD)':
                this.color = '#FFD300'
                break;
            case 'Nhập khẩu: Hóa chất (triệu USD)':
                this.color = '#0AFF99'
                break;
            case 'Nhập khẩu: Ô tô (triệu USD)':
                this.color = '#0AEFFF'
                break;
            case 'Nhập khẩu: Sản phẩm hóa chất (triệu USD)':
                this.color = '#147DF5'
                break;
            case 'Nhập khẩu: Xăng dầu (triệu USD)':
                this.color = '#0077B6'
                break;
            case 'Nhập khẩu: Thức ăn gia súc (triệu USD)':
                this.color = '#FFB337'
                break;
            default:
                this.color = ''
                break;
        }
    }

    static mapToList(data: RetailValueResponse[], order: number) {
        return data.map(item => new RetailValueResponse({ ...item, order }))
    }
}

export class RetailValueSwagger extends BaseResponse {
    @ApiProperty({
        type: RetailValueResponse,
        isArray: true
    })
    data: RetailValueResponse[]
}
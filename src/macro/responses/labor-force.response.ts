import { ApiProperty } from "@nestjs/swagger"
import { UtilCommonTemplate } from "../../utils/utils.common"

export class LaborForceResponse {
    @ApiProperty({
        type: String
    })
    name: string

    @ApiProperty({
        type: String
    })
    date: string

    @ApiProperty({
        type: Number
    })
    value: number

    @ApiProperty({
        type: String
    })
    color: string

    constructor(data?: LaborForceResponse) {
        switch (data?.name) {
            case 'Tin dung (%)':
                this.name = 'Tín dụng (%)'
                break;
            case 'Tin dung (Ty dong)':
                this.name = 'Tín dụng (Tỷ đồng)'
                break;
            default:
                this.name = data?.name || ''
                break;
        }

        this.date = data?.date ? UtilCommonTemplate.toDate(data?.date) : ''
        this.value = data?.value || 0
        switch (data?.name) {
            case 'Lực lượng lao động ( triệu người)':
                this.color = '#2CC8DD'
                break;
            case 'Lao động có việc ( triệu người)':
                this.color = '#3CD8C5'
                break;
            case 'Tỷ lệ chung':
                this.color = '#6CE5E8'
                break;
            case 'Thanh niên':
                this.color = '#41B8D5'
                break;
            case 'Thanh niên thành thị':
                this.color = '#2D8BBA'
                break;
            case 'Công nghiệp- Xây dựng':
                this.color = '#6CE5E8'
                break;
            case 'Dịch vụ':
                this.color = '#41B8D5'
                break;
            case 'Nông lâm ngư nghiệp':
                this.color = '#2D8BBA'
                break;
            case 'Tỉ lệ lao động phi chính thức (%)':
                this.color = '#2D8BBA'
                break;
            case 'Mức chung':
                this.color = '#6CE5E8'
                break;
            case 'Nam giới':
                this.color = '#41B8D5'
                break;
            case 'Nữ giới':
                this.color = '#2D8BBA'
                break;
            case 'Cung tiền M2 (Tỷ đồng)':
                this.color = '#6CE5E8'
                break;
            case 'Tiền gửi của các TCKT (Tỷ đồng)':
                this.color = '#41B8D5'
                break;
            case 'Tiền gửi của dân cư (Tỷ đồng)':
                this.color = '#2D8BBA'
                break;
            case 'Cán cân tài chính (Triệu USD)':
                this.color = '#0097B2'
                break;
            case 'Cán cân tổng thể (Triệu USD)':
                this.color = '#38B6FF'
                break;
            case 'Cán cân vãng lai (Triệu USD)':
                this.color = '#0CC0DF'
                break;
            case 'Dự trữ (Triệu USD)':
                this.color = '#5271FF'
                break;
            case 'Nông nghiệp, lâm nghiệp và thuỷ sản (Tỷ đồng)':
                this.color = '#0097B2'
                break;
            case 'Công nghiệp (Tỷ đồng)':
                this.color = '#0CC0DF'
                break;
            case 'Xây dựng (Tỷ đồng)':
                this.color = '#5CE1E6'
                break;
            case 'Vận tải và Viễn thông (Tỷ đồng)':
                this.color = '#38B6FF'
                break;
            case 'Các hoạt động dịch vụ khác (Tỷ đồng)':
                this.color = '#5271FF'
                break;
            case 'Nông nghiệp, lâm nghiệp và thuỷ sản (%)':
                this.color = '#0097B2'
                break;
            case 'Công nghiệp (%)':
                this.color = '#0CC0DF'
                break;
            case 'Xây dựng (%)':
                this.color = '#5CE1E6'
                break;
            case 'Vận tải và Viễn thông (%)':
                this.color = '#38B6FF'
                break;
            case 'Các hoạt động dịch vụ khác (%)':
                this.color = '#5271FF'
                break;
            case 'NHTM Nhà nước (%)':
                this.color = '#0097B2'
                break;
            case 'NHTM Cổ phần (%)':
                this.color = '#0CC0DF'
                break;
            case 'NH Liên doanh, nước ngoài (%)':
                this.color = '#5CE1E6'
                break;
            case 'Tổng vốn Đăng ký (triệu USD)':
                this.color = '#004AAD'
                break;
            case 'Tổng vốn Giải ngân (triệu USD)':
                this.color = '#3CD8C5'
                break;
            default:
                this.color = ''
                break;
        }
    }

    static mapToList(data?: LaborForceResponse[]) {
        return data.map(item => new LaborForceResponse(item))
    }
}
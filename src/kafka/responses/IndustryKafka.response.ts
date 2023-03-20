import {ApiProperty} from '@nestjs/swagger';
import {IndustryKafkaInterface} from '../interfaces/industry-kafka.interface';

export class IndustryKafkaResponse {
    @ApiProperty({
        type: String,
        description: 'Ngành',
        example: 'Bán lẻ',
    })
    industry: string;

    @ApiProperty({
        type: 'float',
        description: '% Giá giảm ngày',
        example: 99.99,
    })
    day_change_percent: number;

    @ApiProperty({
        type: 'float',
        description: '% Giá giảm tuần',
        example: 99.99,
    })
    week_change_percent: number;

    @ApiProperty({
        type: 'float',
        description: '% Giá giảm tháng',
        example: 99.99,
    })
    month_change_percent: number;

    constructor(data?: IndustryKafkaInterface) {
        switch(data?.vietnameseName) {
            case 'Tài nguyên':
                this.industry = 'Tài nguyên cơ bản';
            break;
            case 'Xây dựng & Vật liệu':
                this.industry = 'Xây dựng và vật liệu xây dựng';
                break;
            case 'Hàng hóa và dịch vụ công nghiệp':
                this.industry = 'Các sản phẩm dịch và dịch vụ công nghiệp';
                break;
            case 'Ôtô & linh kiện phụ tùng ':
                this.industry = 'Ôtô và linh kiện ôtô';
                break;
            case 'Thực phẩm & Đồ uống':
                this.industry = 'Thực phẩm và đồ uống';
                break;
            case 'Dịch vụ bán lẻ':
                this.industry = 'Bán lẻ';
                break;
            case 'Phương tiện truyền thông':
                this.industry = 'Truyền thông';
                break;
            case 'Du lịch & Giải trí':
                this.industry = 'Du lịch và giải trí';
                break;
            case 'Đồ dùng cá nhân và đồ gia dụng':
                this.industry = 'Hàng tiêu dùng cá nhân và gia đình';
                break;
            case 'Dịch vụ tiện ích':
                this.industry = 'Quỹ mở & Quỹ đóng';
                break;
            default:
                this.industry = data?.vietnameseName || ''
        }
        this.day_change_percent = data?.PerChange1D || 0;
        this.week_change_percent = data?.PerChange5D || 0;
        this.month_change_percent = data?.PerChange1M || 0;
    }

    public mapToList(data?: IndustryKafkaInterface[]) {
        return data.map((item) => new IndustryKafkaResponse(item));
    }
}

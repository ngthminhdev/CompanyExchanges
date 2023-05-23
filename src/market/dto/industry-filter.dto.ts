import { IsEnum, IsString } from 'class-validator';
import { GetExchangeQuery } from '../../stock/dto/getExchangeQuery.dto';
import { ApiProperty } from '@nestjs/swagger';

export class IndustryFilterDto extends GetExchangeQuery {
  @IsString()
  @ApiProperty({
    type: String,
    example: 'banLe,baoHiem,batDongSan,nganHang, ...',
    description: `
    baoHiem: 'Bảo hiểm',
    batDongSan: 'Bất động sản',
    congNghe: 'Công nghệ',
    dauKhi: 'Dầu khí',
    banLe: 'Dịch vụ bán lẻ',
    taiChinh: 'Dịch vụ tài chính',
    tienIch: 'Dịch vụ tiện ích',
    doGiaDung: 'Đồ dùng cá nhân và đồ gia dụng',
    duLich: 'Du lịch & Giải trí',
    hangHoa: 'Hàng hóa và dịch vụ công nghiệp',
    hoaChat: 'Hóa chất',
    nganHang: 'Ngân hàng',
    oto: 'Ôtô & linh kiện phụ tùng',
    truyenThong: 'Phương tiện truyền thông',
    thucPham: 'Thực phẩm & Đồ uống',
    vienThong: 'Viễn thông',
    xayDung: 'Xây dựng & Vật liệu',
    yTe: 'Y tế',`,
  })
  industry: string;

  @IsEnum(['0', '1', '2', '3', '4', '5'], { message: 'type not found' })
  @ApiProperty({
    type: Number,
    example: '',
    description:
      '0 - phiên hiện tại/ gần nhất, 1 - 5 phiên, 2 - 1 tháng, 3 - YtD, 4 - 1 Quý (3 tháng), 5 - 1 năm',
  })
  type: string;
}

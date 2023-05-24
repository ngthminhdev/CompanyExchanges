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
    taiNguyen: 'Tài nguyên',
    yTe: 'Y tế',`,
  })
  industry: string;

  // @IsEnum(['0', '1', '2', '3', '4', '5'], { message: 'type not found' })
  // @ApiProperty({
  //   type: Number,
  //   example: '',
  //   description: `
  //   2 - 2 kỳ gần nhất,
  //   4 - 4 kỳ gần nhất,
  //   8 - 8 kỳ gần nhất,
  //   12 - 12 kỳ gần nhất,
  //   25 - 25 kỳ gần nhất
  //   `,
  // })
  // type: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { UtilCommonTemplate } from '../../utils/utils.common';
import { IndusLiquidityInterface } from '../interfaces/indus-liquidity.interface';

export class IndusLiquidityResponse {
  @ApiProperty({
    type: String,
    example: 'ACB',
  })
  industry: string;

  @ApiProperty({
    type: Date,
    example: '2018/03/30',
  })
  date: Date | string;

  @ApiProperty({
    type: String,
    example: '#512DA8',
  })
  color: string;

  @ApiProperty({
    type: Number,
    example: 1.5,
  })
  perChange: number;

  constructor(data?: IndusLiquidityInterface, type: number = 0) {
    this.industry = data?.industry || '';
    switch (this.industry) {
      case 'Bảo hiểm':
        this.color = '#512DA8';
        break;
      case 'Bất động sản':
        this.color = '#303F9F';
        break;
      case 'Công nghệ':
        this.color = '#00796B';
        break;
      case 'Dầu khí':
        this.color = '#689F38';
        break;
      case 'Dịch vụ bán lẻ':
        this.color = '#FFEB3B';
        break;
      case 'Dịch vụ tài chính':
        this.color = '#FFE0B2';
        break;
      case 'Dịch vụ tiện ích':
        this.color = '#2b908f';
        break;
      case 'Đồ dùng cá nhân và đồ gia dụng':
        this.color = '#AFB42B';
        break;
      case 'Du lịch & Giải trí':
        this.color = '#607D8B';
        break;
      case 'Hàng hóa và dịch vụ công nghiệp':
        this.color = '#795548';
        break;
      case 'Hóa chất':
        this.color = '#f7a35c';
        break;
      case 'Ngân hàng':
        this.color = '#f45b5b';
        break;
      case 'Ôtô & linh kiện phụ tùng ':
        this.color = '#00BCD4';
        break;
      case 'Phương tiện truyền thông':
        this.color = '#C2185B';
        break;
      case 'Tài nguyên':
        this.color = '#F8BBD0';
        break;
      case 'Thực phẩm & Đồ uống':
        this.color = '#F0F4C3';
        break;
      case 'Viễn thông':
        this.color = '#B2EBF2';
        break;
      case 'Xây dựng & Vật liệu':
        this.color = '#BDBDBD';
        break;
      case 'Quỹ mở & Quỹ đóng':
        this.color = '#CC521F';
        break;
      default:
        this.color = '#90ed7d';
        break;
    }
    this.date =
      type === 1
        ? data?.date.toString()
        : UtilCommonTemplate.toDate(data?.date) || '';
    this.perChange = data?.perChange || 0;
  }

  public mapToList(data?: IndusLiquidityInterface[], type: number = 0) {
    return data?.map((item) => new IndusLiquidityResponse(item, type));
  }
}

export class IndusLiquiditySwagger {
  @ApiProperty({
    type: IndusLiquidityResponse,
    isArray: true,
  })
  data: IndusLiquidityResponse[];
}

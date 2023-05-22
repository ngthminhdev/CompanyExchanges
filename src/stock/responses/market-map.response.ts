import { ApiProperty, PartialType } from '@nestjs/swagger';
import { BaseResponse } from '../../utils/utils.response';

export class MarketMapResponse {
  @ApiProperty({
    type: String,
  })
  EXCHANGE: string;

  @ApiProperty({
    type: String,
  })
  LV2: string;

  @ApiProperty({
    type: String,
    example: '',
  })
  color: string;

  @ApiProperty({
    type: String,
  })
  ticker: string;

  @ApiProperty({
    type: 'float',
    example: 99.99,
  })
  value: number;

  constructor(data?: any) {
    this.EXCHANGE = data?.global || '';
    this.LV2 = data?.industry || '';
    switch (this.LV2) {
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
      default:
        this.color = '#90ed7d';
        break;
    }
    this.ticker = data?.ticker || '';
    this.value = data?.value || 0;
  }

  public mapToList(data?: any[]) {
    return data.map((item) => new MarketMapResponse(item));
  }
}

export class MarketMapSwagger extends PartialType(BaseResponse) {
  @ApiProperty({
    type: MarketMapResponse,
    isArray: true,
  })
  data: MarketMapResponse[];
}

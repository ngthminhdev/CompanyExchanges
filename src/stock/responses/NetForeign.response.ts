import { ApiProperty, PartialType } from '@nestjs/swagger';
import { BaseResponse } from '../../utils/utils.response';
import { NetForeignInterface } from '../interfaces/net-foreign.interface';

export class NetForeignResponse {
  @ApiProperty({
    type: String,
    example: 'VNIndex',
  })
  EXCHANGE: string;

  @ApiProperty({
    type: String,
    example: 'Hóa Chất',
  })
  LV2: string;

  @ApiProperty({
    type: String,
    example: '',
  })
  color: string;

  @ApiProperty({
    type: String,
    example: 'VCB',
  })
  ticker: string;

  @ApiProperty({
    type: Number,
    example: 65.5,
  })
  total_value_buy?: number;

  @ApiProperty({
    type: Number,
    example: 65.5,
  })
  total_value_sell?: number;

  constructor(data?: NetForeignInterface) {
    this.EXCHANGE =
      data?.EXCHANGE && data?.EXCHANGE == 'HSX' ? 'HOSE' : data?.EXCHANGE || '';
    this.LV2 = data?.LV2 || '';
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
      case 'Quỹ mở & Quỹ đóng':
        this.color = '#CC521F';
        break;
      default:
        this.color = '#90ed7d';
        break;
    }
    this.ticker = data?.ticker || '';
    data?.total_value_buy != undefined &&
      (this.total_value_buy = data?.total_value_buy);
    data?.total_value_sell != undefined &&
      (this.total_value_sell = -data?.total_value_sell);
  }

  public mapToList(data?: NetForeignInterface[] | any[]) {
    return data.map((i) => new NetForeignResponse(i));
  }
}

export class NetForeignSwagger extends PartialType(BaseResponse) {
  @ApiProperty({
    type: NetForeignResponse,
    isArray: true,
  })
  data: NetForeignResponse[];
}

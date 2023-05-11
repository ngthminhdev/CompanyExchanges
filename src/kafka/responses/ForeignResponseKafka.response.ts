import { ApiProperty, PartialType } from '@nestjs/swagger';
import { BaseResponse } from '../../utils/utils.response';
import { ForeignKafkaInterface } from '../interfaces/foreign-kafka.interface';

export class ForeignKafkaResponse {
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
    example: '#123321',
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

  constructor(data?: any) {
    this.EXCHANGE = data?.floor || '';
    switch (data?.industry) {
      case 'Hàng tiêu dùng cá nhân và gia đình':
        this.LV2 = 'Đồ dùng cá nhân và đồ gia dụng';
        break;
      case 'Xây dựng và vật liệu xây dựng':
        this.LV2 = 'Xây dựng & Vật liệu';
        break;
      case 'Bán lẻ':
        this.LV2 = 'Dịch vụ bán lẻ';
        break;
      case 'Các sản phẩm và dịch vụ công nghiệp':
        this.LV2 = 'Hàng hóa và dịch vụ công nghiệp';
        break;
      case 'Ôtô và linh kiện ôtô':
        this.LV2 = 'Ôtô & linh kiện phụ tùng ';
        break;
      case 'Truyền thông':
        this.LV2 = 'Phương tiện truyền thông';
        break;
      case 'Thực phẩm và đồ uống':
        this.LV2 = 'Thực phẩm & Đồ uống';
        break;
      case 'Tài nguyên cơ bản':
        this.LV2 = 'Tài nguyên';
        break;
      case 'Quỹ mở & Quỹ đóng':
        this.LV2 = 'Dịch vụ tiện ích';
        break;
      case 'Du lịch và giải trí':
        this.LV2 = 'Du lịch & Giải trí';
        break;
      case 'asdasdasd':
        this.LV2 = 'asdasdasd';
        break;
      case 'asdasdasd':
        this.LV2 = 'asdasdasd';
        break;
      default:
        break;
    }
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
    this.ticker = data?.code || '';
    data?.netVal > 0
      ? (this.total_value_buy = data?.netVal || 0)
      : (this.total_value_sell = data?.netVal || 0);
  }

  public mapToList(data?: ForeignKafkaInterface[] | any[]) {
    return data.map((i) => new ForeignKafkaResponse(i));
  }
}

export class ForeignKafkaSwagger extends PartialType(BaseResponse) {
  @ApiProperty({
    type: ForeignKafkaResponse,
    isArray: true,
  })
  data: ForeignKafkaResponse[];
}

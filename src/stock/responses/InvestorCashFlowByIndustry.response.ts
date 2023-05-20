import { ApiProperty, PartialType } from '@nestjs/swagger';
import { BaseResponse } from '../../utils/utils.response';
import { InvestorCashFlowByIndustryInterface } from '../interfaces/investor-cash-flow-by-industry.interface';
import { UtilCommonTemplate } from '../../utils/utils.common';

export class InvestorCashFlowByIndustryResponse {
  @ApiProperty({
    type: String,
    example: 1.05,
  })
  industry: string;

  @ApiProperty({
    type: String,
    example: '#512DA8',
  })
  color: string;

  @ApiProperty({
    type: Number,
    example: 1.05,
  })
  buyVal: number;

  @ApiProperty({
    type: Number,
    example: 1.05,
  })
  sellVal: number;

  @ApiProperty({
    type: Number,
    example: 1.05,
  })
  netVal: number;

  @ApiProperty({
    type: Number,
    example: 1.05,
  })
  transVal: number;

  @ApiProperty({
    type: Number,
    example: 1.05,
  })
  type: number;

  @ApiProperty({
    type: Date,
    example: 1.05,
  })
  date: Date | string;

  @ApiProperty({
    type: Number,
    example: 1.05,
  })
  marketTotalVal: number;

  @ApiProperty({
    type: Number,
    example: 1.05,
  })
  percent: number;

  constructor(data?: InvestorCashFlowByIndustryInterface) {
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
      default:
        this.color = '#90ed7d';
        break;
    }
    this.buyVal = data?.buyVal || 0;
    this.sellVal = data?.sellVal || 0;
    this.netVal = data?.netVal || 0;
    this.transVal = data?.transVal || 0;
    this.type = data?.type || 0;
    this.date = UtilCommonTemplate.toDate(data?.date) || '';
    this.marketTotalVal = data?.marketTotalVal || 0;
    this.percent = data?.percent || 0;
  }

  public mapToList(data?: InvestorCashFlowByIndustryInterface[]) {
    return data?.map((i) => new InvestorCashFlowByIndustryResponse(i));
  }
}

export class InvestorCashFlowByIndustrySwagger extends PartialType(
  BaseResponse,
) {
  @ApiProperty({
    type: InvestorCashFlowByIndustryResponse,
    isArray: true,
  })
  data: InvestorCashFlowByIndustryResponse[];
}

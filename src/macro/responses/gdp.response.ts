import { ApiProperty } from '@nestjs/swagger';
import { UtilCommonTemplate } from '../../utils/utils.common';
import { IIndustryGDPValue } from '../interfaces/industry-gdp-value.interface';

export class GDPResponse {
  @ApiProperty({
    type: String,
  })
  name: string;

  @ApiProperty({
    type: Date,
  })
  date: Date | string;

  @ApiProperty({
    type: Number,
  })
  value: number;

  @ApiProperty({
    type: String,
  })
  color: string;

  constructor(data?: IIndustryGDPValue) {
    this.name = data?.name || '';
    this.date = UtilCommonTemplate.toDate(data?.date);
    this.value = data?.value || 0;
    switch (this.name) {
      case 'Bán buôn và bán lẻ; sửa chữa ô tô, mô tô, xe máy và xe có động cơ khác ':
        this.color = '#FF8700';
        break;
      case 'Vận tải, kho bãi':
        this.color = '#FF0000';
        break;
      case 'Công nghiệp chế biến, chế tạo':
        this.color = '#BE0AFF';
        break;
      case 'Hoạt động kinh doanh bất động sản ':
        this.color = '#FF6699';
        break;
      case 'Xây dựng':
        this.color = '#0AEFFF';
        break;
      case 'Khai khoáng':
        this.color = '#A1FF0A';
        break;
      default:
        this.color = '';
    }
  }

  public mapToList(data?: IIndustryGDPValue[]) {
    return data?.map((item) => new GDPResponse(item));
  }
}

export class GDPSwagger {
  @ApiProperty({
    type: GDPResponse,
    isArray: true,
  })
  data: GDPResponse[];
}

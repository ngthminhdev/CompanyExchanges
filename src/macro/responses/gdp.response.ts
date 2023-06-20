import { ApiProperty } from "@nestjs/swagger";
import { IIndustryGDPValue } from "../interfaces/industry-gdp-value.interface";
import { UtilCommonTemplate } from "../../utils/utils.common";


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

  constructor(data?: IIndustryGDPValue) {
    this.name = data?.name || '';
    this.date = UtilCommonTemplate.toDate(data?.date);
    this.value = data?.value || 0
  }

  public mapToList(data?: IIndustryGDPValue[]) {
    return data?.map(item => new GDPResponse(item))
  }
}

export class GDPSwagger {
  @ApiProperty({
    type: GDPResponse,
    isArray: true,
  })
  data: GDPResponse[];
}
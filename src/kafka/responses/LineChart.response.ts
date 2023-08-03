import { ApiProperty, ApiResponseProperty, PartialType } from '@nestjs/swagger';
import * as moment from 'moment';
import { VnIndexResponse } from '../../stock/responses/Vnindex.response';
import { BaseResponse } from '../../utils/utils.response';
import { LineChartInterface, LineChartInterfaceV2 } from '../interfaces/line-chart.interface';

export class LineChartResponse extends VnIndexResponse {
  @ApiResponseProperty({
    type: Number,
  })
  tradingDate: number;

  constructor(data?: LineChartInterface) {
    super(data);
    this.tradingDate = Date.UTC(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate(),
      new Date(data?.tradingDate)?.getHours(),
      new Date(data?.tradingDate)?.getMinutes(),
    ).valueOf();
  }

  public mapToList(data?: LineChartInterface[]) {
    return data.map((i) => new LineChartResponse(i));
  }
}

export class LineChartSwagger extends PartialType(BaseResponse) {
  @ApiProperty({
    type: LineChartResponse,
    isArray: true,
  })
  data: LineChartResponse[];
}

export class LineChartResponseV2 {
  comGroupCode: string;
  indexValue: number;
  tradingDate: number;
  indexChange: number;
  percentIndexChange: number;
  openIndex: number;
  closeIndex: number;
  highestIndex: number;
  lowestIndex: number;
  matchVolume: number;
  matchValue: number;
  totalMatchVolume: number;
  totalMatchValue: number;

  constructor(data?: LineChartInterfaceV2) {
    this.comGroupCode = data?.code || '';
    this.indexValue = data?.closePrice || 0;
    this.tradingDate = moment(data.timeInday, 'HH:mm').valueOf()
    this.indexChange = data?.change || 0;
    this.percentIndexChange = data?.perChange || 0;
    this.openIndex = data?.openPrice || 0;
    this.closeIndex = data?.closePrice || 0;
    this.highestIndex = data?.highPrice || 0;
    this.lowestIndex = data?.lowPrice || 0;
    this.matchVolume = data?.omVol || 0;
    this.matchValue = data?.omVal || 0;
    this.totalMatchVolume = data?.totalVol || 0;
    this.totalMatchValue = data?.totalVal || 0;
  }

  static mapToList(data?: LineChartInterfaceV2[]) {
    return data.map(item => new LineChartResponseV2(item))
  }
}

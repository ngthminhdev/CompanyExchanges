import {ApiProperty, ApiResponseProperty, PartialType} from "@nestjs/swagger";
import {BaseResponse} from "../../utils/utils.response";
import {UtilCommonTemplate} from "../../utils/utils.common";
import {VnIndexResponse} from "../../stock/responses/Vnindex.response";
import {LineChartInterface} from "../interfaces/line-chart.interface";


export class LineChartResponse extends VnIndexResponse{
    @ApiResponseProperty({
        type: Number
    })
    tradingDate: number;

    constructor(data?: LineChartInterface) {
        super(data);
        this.tradingDate = Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), +UtilCommonTemplate.toTime(data?.tradingDate)?.split(":")![0] || new Date().getHours(), +UtilCommonTemplate.toTime(data?.tradingDate)?.split(":")![1] || new Date().getMinutes(), +UtilCommonTemplate.toTime(data?.tradingDate)?.split(":")![2] || new Date().getSeconds()).valueOf()
    }

    public mapToList(data?: LineChartInterface[]) {
        return data.map(i => new LineChartResponse(i))
    }
}

export class LineChartSwagger extends PartialType(BaseResponse) {
    @ApiProperty({
        type: LineChartResponse,
        isArray: true,
    })
    data: LineChartResponse[];
}
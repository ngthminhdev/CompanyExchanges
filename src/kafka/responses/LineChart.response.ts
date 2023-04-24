import {ApiProperty, ApiResponseProperty, PartialType} from "@nestjs/swagger";
import {BaseResponse} from "../../utils/utils.response";
import {UtilCommonTemplate} from "../../utils/utils.common";
import {LineChartInterface} from "../../kafka/interfaces/line-chart.interface";
import {TransactionTimeTypeEnum} from "../../enums/common.enum";
import {VnIndexResponse} from "../../stock/responses/Vnindex.response";


export class LineChartResponse extends VnIndexResponse{
    @ApiResponseProperty({
        type: Number
    })
    tradingDate: number;
    
    constructor(data?: LineChartInterface) {
        super();
        this.tradingDate = Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), +UtilCommonTemplate.toTime(data?.tradingDate)?.split(":")![0] || new Date().getHours(), +UtilCommonTemplate.toTime(data?.tradingDate)?.split(":")![1] || new Date().getMinutes()).valueOf()
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
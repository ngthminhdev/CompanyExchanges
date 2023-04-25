import { ApiProperty, ApiResponseProperty, PartialType } from "@nestjs/swagger";
import { VnIndexResponse } from "../../stock/responses/Vnindex.response";
import { BaseResponse } from "../../utils/utils.response";
import { LineChartInterface } from "../interfaces/line-chart.interface";


export class LineChartResponse extends VnIndexResponse{
    @ApiResponseProperty({
        type: Number
    })
    tradingDate: number;

    constructor(data?: LineChartInterface) {
        super(data);
        this.tradingDate = Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 
        new Date(data?.tradingDate)?.getHours(), 
        new Date(data?.tradingDate)?.getMinutes()).valueOf()
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
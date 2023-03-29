import {ApiProperty, ApiResponseProperty, PartialType} from "@nestjs/swagger";
import {BaseResponse} from "../../utils/utils.response";
import {UtilCommonTemplate} from "../../utils/utils.common";
import {MarketEvaluationInterface} from "../interfaces/market-evaluation.interface";


export class MarketEvaluationResponse {
    @ApiResponseProperty({
        type: String,
    })
    Ticker: string;

    @ApiResponseProperty({
        type: Date,
    })
    date: Date | string;

    @ApiResponseProperty({
        type: Number,
    })
    sigd: number;

    @ApiResponseProperty({
        type: Number,
    })
    sigw: number;

    @ApiResponseProperty({
        type: Number,
    })
    sigm: number;

    @ApiResponseProperty({
        type: Number,
    })
    sigy: number;

    constructor(data?: MarketEvaluationInterface) {
        this.Ticker = data?.Ticker || "";
        this.sigd = +data?.sigd || 0;
        this.sigw = +data?.sigw || 0;
        this.sigm = +data?.sigm || 0;
        this.sigy = +data?.sigy || 0;
        this.date = UtilCommonTemplate.toDateTime(data?.["Date Time"]) || "";
    }

    public mapToList(data?: MarketEvaluationInterface[] | any[]) {
        return data.map(i => new MarketEvaluationResponse(i))
    }
}

export class MarketEvaluationSwagger extends PartialType(BaseResponse) {
    @ApiProperty({
        type: MarketEvaluationResponse,
        isArray: true,
    })
    data: MarketEvaluationResponse[];
}
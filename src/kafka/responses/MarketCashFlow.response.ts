import {ApiProperty} from "@nestjs/swagger";
import {BaseResponse} from "../../utils/utils.response";


export class MarketCashFlowResponse {

    @ApiProperty({
        type: Number
    })
    equal: number;

    @ApiProperty({
        type: Number
    })
    increase: number;

    @ApiProperty({
        type: Number
    })
    decrease: number;


    constructor(data: any) {
        this.equal = data?.equal || 0;
        this.increase = data?.increase || 0;
        this.decrease = data?.decrease || 0;
    }
}

export class MarketCashFlowSwagger extends BaseResponse {
    @ApiProperty({
        type: MarketCashFlowResponse
    })
    data: MarketCashFlowResponse
}
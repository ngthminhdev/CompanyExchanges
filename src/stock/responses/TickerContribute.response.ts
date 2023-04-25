import {ApiProperty, PartialType} from "@nestjs/swagger";
import {BaseResponse} from "../../utils/utils.response";
import {TickerContributeInterface} from "../interfaces/ticker-contribute.interface";


export class TickerContributeResponse {
    @ApiProperty({
        type: String,
        example: 'VCB'
    })
    symbol: string;

    @ApiProperty({
        type: Number,
        example: 65.5
    })
    contribute_price: number;


    constructor(data?: TickerContributeInterface) {
        this.symbol = data?.symbol || '';
        this.contribute_price = data?.contribute_price || 0;
    }

    public mapToList(data?: TickerContributeInterface[] | any[]) {
        return data.map(i => new TickerContributeResponse(i))
    }
}

export class TickerContributeSwagger extends PartialType(BaseResponse) {
    @ApiProperty({
        type: TickerContributeResponse,
        isArray: true,
    })
    data: TickerContributeResponse[];
}
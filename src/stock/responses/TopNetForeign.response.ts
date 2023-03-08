import {ApiProperty, PartialType} from "@nestjs/swagger";
import {BaseResponse} from "../../utils/utils.response";
import {TopNetForeignInterface} from "../interfaces/top-net-foreign.interface";


export class TopNetForeignResponse {
    @ApiProperty({
        type: String,
        example: 'VNIndex'
    })
    ticker: string;

    @ApiProperty({
        type: Number,
        example: 65.5
    })
    net_value_foreign: number;



    constructor(data?: TopNetForeignInterface) {
        this.ticker = data?.ticker || '';
        this.net_value_foreign = data?.net_value_foreign || 0;
    }

    public mapToList(data?: TopNetForeignInterface[] | any[]) {
        return data.map(i => new TopNetForeignResponse(i))
    }
}

export class TopNetForeignSwagger extends PartialType(BaseResponse) {
    @ApiProperty({
        type: TopNetForeignResponse,
        isArray: true,
    })
    data: TopNetForeignResponse[];
}
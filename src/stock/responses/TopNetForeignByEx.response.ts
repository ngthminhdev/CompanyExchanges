import {ApiProperty, PartialType} from "@nestjs/swagger";
import {BaseResponse} from "../../utils/utils.response";
import {TopNetForeignByExInterface} from "../interfaces/top-net-foreign-by-ex.interface";


export class TopNetForeignByExResponse {
    @ApiProperty({
        type: String,
        example: 'VCB'
    })
    ticker: string;

    @ApiProperty({
        type: String,
        example: 'HSX'
    })
    exchange: string;

    @ApiProperty({
        type: Number,
        example: 65.5
    })
    net_value: number;



    constructor(data?: TopNetForeignByExInterface) {
        this.ticker = data?.ticker || '';
        this.exchange = data?.exchange || '';
        this.net_value = data?.net_value || 0;
    }

    public mapToList(data?: TopNetForeignByExInterface[] | any[]) {
        return data.map(i => new TopNetForeignByExResponse(i))
    }
}

export class TopNetForeignByExsSwagger extends PartialType(BaseResponse) {
    @ApiProperty({
        type: TopNetForeignByExResponse,
        isArray: true,
    })
    data: TopNetForeignByExResponse[];
}
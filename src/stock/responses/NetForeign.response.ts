import {ApiProperty, PartialType} from "@nestjs/swagger";
import {BaseResponse} from "../../utils/utils.response";
import {NetForeignInterface} from "../interfaces/net-foreign.interface";


export class NetForeignResponse {
    @ApiProperty({
        type: String,
        example: 'VNIndex'
    })
    EXCHANGE: string;

    @ApiProperty({
        type: String,
        example: 'Hóa Chất'
    })
    LV2: string;

    @ApiProperty({
        type: String,
        example: 'VCB'
    })
    ticker: string;

    @ApiProperty({
        type: Number,
        example: 65.5
    })
    total_value_buy?: number;

    @ApiProperty({
        type: Number,
        example: 65.5
    })
    total_value_sell?: number;

    constructor(data?: NetForeignInterface) {
        this.EXCHANGE = data?.EXCHANGE || '';
        this.LV2 = data?.LV2 || '';
        this.ticker = data?.ticker || '';
        data?.total_value_buy != undefined && (this.total_value_buy = data?.total_value_buy);
        data?.total_value_sell != undefined && (this.total_value_sell = -data?.total_value_sell);
    }

    public mapToList(data?: NetForeignInterface[] | any[]) {
        return data.map(i => new NetForeignResponse(i))
    }
}

export class NetForeignSwagger extends PartialType(BaseResponse) {
    @ApiProperty({
        type: NetForeignResponse,
        isArray: true,
    })
    data: NetForeignResponse[];
}
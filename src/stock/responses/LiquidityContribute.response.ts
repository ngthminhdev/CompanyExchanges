import {ApiProperty, PartialType} from "@nestjs/swagger";
import {BaseResponse} from "../../utils/utils.response";


export class LiquidContributeResponse {
    @ApiProperty({
        type: String,
        example: 'VNIndex'
    })
    symbol: string;

    @ApiProperty({
        type: Number,
        example: 1502.9
    })
    contribute: number;

    @ApiProperty({
        type: Number,
        example: 1502.9
    })
    totalValueMil: number;

    @ApiProperty({
        type: Number,
        example: 502.9
    })
    totalVolume: number;

    @ApiProperty({
        type: Number,
        example: 502.9
    })
    supplyDemandValueGap: number;

    @ApiProperty({
        type: Number,
        example: 502.9
    })
    supplyDemandVolumeGap: number;

    constructor(data?: any, exchangeVolume?: number) {
        this.symbol = data?.symbol || 0;
        this.contribute = (data?.totalValueMil / exchangeVolume) * 100 || 0;
        this.totalValueMil = data?.totalValueMil || 0;
        this.totalVolume = data?.totalVolume || 0;
        this.supplyDemandValueGap = data?.supplyDemandValueGap || 0;
        this.supplyDemandVolumeGap = +data?.supplyDemandVolumeGap || 0;
    }

    public mapToList(data?: any[], exchangeVolume?: number) {
        return data.map(i => new LiquidContributeResponse(i, exchangeVolume))
    }
}

export class LiquidContributeSwagger extends PartialType(BaseResponse) {
    @ApiProperty({
        type: LiquidContributeResponse,
        isArray: true,
    })
    data: LiquidContributeResponse[];
}
import {ApiProperty, PartialType} from "@nestjs/swagger";
import {DomesticIndexInterface} from "../interfaces/domestic-index.interface";
import {BaseResponse} from "../../utils/utils.response";
import {UtilCommonTemplate} from "../../utils/utils.common";


export class DomesticIndexResponse {
    @ApiProperty({
        type: String,
        example: 'VNIndex'
    })
    comGroupCode: string;

    @ApiProperty({
        type: Number,
        example: 1502.9
    })
    indexValue: number;

    @ApiProperty({
        type: Number,
        example: 502.9
    })
    net_value_foreign: number;

    @ApiProperty({
        type: Number,
        example: 502.9
    })
    totalMatchVolume: number;

    @ApiProperty({
        type: Number,
        example: 502.9
    })
    totalMatchValue: number;

    @ApiProperty({
        type: Number,
        example: 5.2
    })
    indexChange: number;

    @ApiProperty({
        type: Number,
        example: 0.9
    })
    percentIndexChange: number;

    @ApiProperty({
        type: Date,
    })
    lastUpdated: Date | string;

    constructor(data?: DomesticIndexInterface) {
        this.comGroupCode = data?.ticker || "";
        this.indexValue = data?.close_price || 0;
        this.indexChange = data?.change_price|| 0;
        this.totalMatchVolume = data?.volume || 0;
        this.totalMatchValue = data?.value || 0;
        this.net_value_foreign = data?.net_value_foreign || 0;
        this.percentIndexChange = +data?.percent_d || 0;
        this.lastUpdated = UtilCommonTemplate.toDateTime(data?.date_time) || "";
    }

    public mapToList(data?: DomesticIndexInterface[] | any[]) {
        return data.map(i => new DomesticIndexResponse(i))
    }
}

export class DomesticIndexSwagger extends PartialType(BaseResponse) {
    @ApiProperty({
        type: DomesticIndexResponse,
        isArray: true,
    })
    data: DomesticIndexResponse[];
}
import {ApiProperty, PartialType} from "@nestjs/swagger";
import {DomesticIndexInterface} from "../interfaces/domestic-index.interface";
import {BaseResponse} from "../../utils/utils.response";
import {UtilCommonTemplate} from "../../utils/utils.common";


export class DomesticIndexResponse {
    @ApiProperty({
        type: String,
        example: 'VNIndex'
    })
    ticker: string;

    @ApiProperty({
        type: Number,
        example: 1502.9
    })
    price: number;

    @ApiProperty({
        type: Number,
        example: 5.2
    })
    change_price: number;

    @ApiProperty({
        type: Number,
        example: 0.9
    })
    percent_d: number;

    @ApiProperty({
        type: Date,
    })
    lastUpdated: Date | string;

    constructor(data?: DomesticIndexInterface) {
        this.ticker = data?.ticker || '';
        this.price = data?.close_price || 0;
        this.change_price = data?.change_price|| 0;
        this.percent_d = +data?.percent_d || 0;
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
import {ApiProperty, PartialType} from "@nestjs/swagger";
import {BaseResponse} from "../../utils/utils.response";
import { ForeignKafkaInterface } from "../interfaces/foreign-kafka.interface";


export class ForeignKafkaResponse {
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

    constructor(data?: any) {
        this.EXCHANGE = data?.floor || '';
        this.LV2 = data?.industry || '';
        this.ticker = data?.code || '';
        (data?.netVal > 0 ? (this.total_value_buy = data?.netVal || 0) : (this.total_value_sell = data?.netVal || 0))
    }

    public mapToList(data?: ForeignKafkaInterface[] | any[]) {
        return data.map(i => new ForeignKafkaResponse(i))
    }
}

export class ForeignKafkaSwagger extends PartialType(BaseResponse) {
    @ApiProperty({
        type: ForeignKafkaResponse,
        isArray: true,
    })
    data: ForeignKafkaResponse[];
}
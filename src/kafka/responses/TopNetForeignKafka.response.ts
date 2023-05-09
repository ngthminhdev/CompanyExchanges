import {ApiProperty, PartialType} from "@nestjs/swagger";
import {BaseResponse} from "../../utils/utils.response";
import { ForeignKafkaInterface } from "../interfaces/foreign-kafka.interface";


export class TopNetForeignKafkaResponse {
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



    constructor(data?: ForeignKafkaInterface) {
        this.ticker = data?.code || '';
        this.net_value_foreign = data?.netVal || 0;
    }

    public mapToList(data?: ForeignKafkaInterface[] | any[]) {
        return data.map(i => new TopNetForeignKafkaResponse(i))
    }
}

export class TopNetForeignKafkaSwagger extends PartialType(BaseResponse) {
    @ApiProperty({
        type: TopNetForeignKafkaResponse,
        isArray: true,
    })
    data: TopNetForeignKafkaResponse[];
}
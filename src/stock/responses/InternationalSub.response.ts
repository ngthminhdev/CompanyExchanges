import {ApiProperty, PartialType} from "@nestjs/swagger";
import {BaseResponse} from "../../utils/utils.response";
import {InternationalIndexInterface} from "../interfaces/international-index.interface";


export class InternationalSubResponse {
    @ApiProperty({
        type: String,
        example: 'VNIndex'
    })
    ticker: string;

    @ApiProperty({
        type: Number,
        example: 1502.9
    })
    diemso: number;

    @ApiProperty({
        type: Date,
        example: 5.2
    })
    date_time: Date | string;

    @ApiProperty({
        type: Number,
        example: 0.9
    })
    percent_d: number;

    @ApiProperty({
        type: Number,
        example: 0.9
    })
    percent_w: number;

    @ApiProperty({
        type: Number,
        example: 0.9
    })
    percent_m: number;

    @ApiProperty({
        type: Number,
        example: 0.9
    })
    percent_ytd: number;

    constructor(data?: any) {
        this.ticker = data?.ticker ? data?.ticker.replace('^', '') : '';
        this.diemso = data?.diemso || 0;
        this.date_time = data?.date_time || "";
        this.percent_d = data?.percent_d ? +data?.percent_d.split(' (')[1].slice(0, data?.percent_d.split(' (')[1].length - 2) : 0;
        this.percent_w = data?.percent_w ? +data?.percent_w.split(' (')[1].slice(0, data?.percent_w.split(' (')[1].length - 2) : 0;
        this.percent_m = data?.percent_m ? +data?.percent_m.split(' (')[1].slice(0, data?.percent_m.split(' (')[1].length - 2) : 0;
        this.percent_ytd = data?.percent_ytd ? +data?.percent_ytd.split(' (')[1].slice(0, data?.percent_ytd.split(' (')[1].length - 2) : 0;
    }

    public mapToList(data?: any[]) {
        return data.map(i => new InternationalSubResponse(i))
    }
}

export class InternationalIndexSwagger extends PartialType(BaseResponse) {
    @ApiProperty({
        type: InternationalSubResponse,
        isArray: true,
    })
    data: InternationalSubResponse[];
}
import {ApiProperty, PartialType} from "@nestjs/swagger";
import {BaseResponse} from "../../utils/utils.response";
import {MerchandisePriceInterface} from "../interfaces/merchandise-price.interface";


export class MerchandisePriceResponse {
    @ApiProperty({
        type: String,
        example: 'Vàng'
    })
    name: string;

    @ApiProperty({
        type: Number,
        example: 89.3
    })
    price: number;

    @ApiProperty({
        type: String,
        example: 'USD/Thùng'
    })
    unit: string;


    @ApiProperty({
        type: String,
        example: '-1.32%'
    })
    Day: string;

    @ApiProperty({
        type: String,
        example: '2.12%'
    })
    MTD: string;

    @ApiProperty({
        type: String,
        example: '-0.5%'
    })
    YTD: string;


    constructor(data: MerchandisePriceInterface, type: number) {
        this.name = data?.name || '';
        this.price = data?.price || 0;
        this.unit = data?.unit || '';
        this.Day = data?.Day ? (+type ? data?.Day: data?.Day.split(' (')[1].slice(0, data?.Day.split(' (')[1].length - 1)) : '';
        this.MTD = data?.MTD ? data?.MTD.split(' (')[1].slice(0, data?.MTD.split(' (')[1].length - 1) : '';
        this.YTD = data?.YTD ? data?.YTD.split(' (')[1].slice(0, data?.YTD.split(' (')[1].length - 1) : '';
    }

    static mapToList(data: MerchandisePriceInterface[] | any[], type: number) {
        return data.map(i => new MerchandisePriceResponse(i, type))
    }
}

export class MerchandisePriceSwagger extends PartialType(BaseResponse) {
    @ApiProperty({
        type: MerchandisePriceResponse,
        isArray: true,
    })
    data: MerchandisePriceResponse[];
}
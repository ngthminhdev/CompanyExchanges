import {ApiProperty, PartialType} from "@nestjs/swagger";
import {BaseResponse} from "../../utils/utils.response";
import {UtilCommonTemplate} from "../../utils/utils.common";
import {StockEventsInterface} from "../interfaces/stock-events.interface";


export class StockEventsResponse {
    @ApiProperty({
        type: String,
        example: 'HHP'
    })
    ticker: string;

    @ApiProperty({
        type: String,
        example: 'HOSE'
    })
    san: string;

    @ApiProperty({
        type: Date,
        example: '2023-03-03'
    })
    NgayGDKHQ: Date | string;

    @ApiProperty({
        type: Date,
        example: '2023-03-03'
    })
    NgayDKCC: Date | string;

    @ApiProperty({
        type: Date,
        example: '2023-03-03'
    })
    NgayThucHien: Date | string;

    @ApiProperty({
        type: String,
        example: 'Trả cổ tức năm 2021 bằng tiền, 1,140 đồng/CP'
    })
    NoiDungSuKien: string;

    @ApiProperty({
        type: String,
        example: 'Trả cổ tức bằng tiền mặt'
    })
    LoaiSuKien: string;

    @ApiProperty({
        type: Number,
        example: 1100
    })
    vnd: number;

    constructor(data?: StockEventsInterface | any) {
        this.ticker = data?.ticker || '';
        this.san = data?.san || '';
        this.NoiDungSuKien = data?.NoiDungSuKien || '';
        this.LoaiSuKien = data?.LoaiSuKien || '';
        this.vnd = data?.vnd || 0;
        this.NgayGDKHQ = UtilCommonTemplate.toDate(data?.NgayGDKHQ) || "";
        this.NgayDKCC = UtilCommonTemplate.toDate(data?.NgayDKCC) || "";
        this.NgayThucHien = UtilCommonTemplate.toDate(data?.NgayThucHien) || "";

    }

    public mapToList(data?: StockEventsInterface[] | any[]) {
        return data.map((i) => new StockEventsResponse(i))
    }
}

export class StockEventsSwagger extends PartialType(BaseResponse) {
    @ApiProperty({
        type: StockEventsResponse,
        isArray: true,
    })
    data: StockEventsResponse[];
}
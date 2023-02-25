import {ApiProperty, PartialType} from "@nestjs/swagger";
import {BaseResponse} from "../utils/utils.response";


export class MarketVolatilityResponse {
    @ApiProperty({
        type: String,
        description: "Mã sàn chứng khoán",
        example: "VN30"
    })
    ticker: string;

    @ApiProperty({
        type: "float",
        description: "Giá hiện tại",
        example: "1650.1"
    })
    current_price: number;

    @ApiProperty({
        type: String,
        description: "Tỷ lệ thay đổi so với phiên trước",
        example: "-1"
    })
    last_price: number;

    @ApiProperty({
        type: String,
        description: "Tỷ lệ thay đổi trung bình tuần ",
        example: "0.4"
    })
    week_avg: number;

    @ApiProperty({
        type: String,
        description: "Tỷ lệ thay đổi trung bình tháng",
        example: "2"
    })
    month_avg: number;

    @ApiProperty({
        type: String,
        description: "Tỷ lệ thay đổi trung bình năm",
        example: "-5"
    })
    year_avg: number;

    constructor(data?: any) {
        this.ticker = data?.ticker ?? "";
        this.current_price = data?.open_price ?? 0;
        this.last_price = data?.percent_d ?? "";
        this.week_avg = data?.percent_w ?? "";
        this.month_avg = data?.percent_m ?? "";
        this.year_avg = data?.percent_y ?? "";
    }

    public mapToList(data? : any[]) {
        return data?.map(item => new MarketVolatilityResponse(item))
    }
}

export class MarketVolatilitySwagger extends PartialType(BaseResponse) {    
    @ApiProperty({
        type: MarketVolatilityResponse,
        isArray: true
    })
    data: MarketVolatilityResponse
}

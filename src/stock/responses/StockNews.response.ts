import {ApiProperty, PartialType} from "@nestjs/swagger";
import {BaseResponse} from "../../utils/utils.response";
import {UtilCommonTemplate} from "../../utils/utils.common";


export class StockNewsResponse {
    @ApiProperty({
        type: String,
        isArray: true,
        example: ['ACB', 'VCB'],
        description: 'Những mã cổ phiếu trong tin tức'
    })
    TickerInNews: string;

    @ApiProperty({
        type: String,
        example: 'Cạm bẫy trên sàn Forex'
    })
    Title: string;

    @ApiProperty({
        type: String,
        example: 'https://cafef.vn/cam-bay-tren-san-forex-20230307085507814.chn'
    })
    Href: string;

    @ApiProperty({
        type: String,
        description: 'Ảnh tin tức',
        example: 'https://cafefcdn.com/zoom/250_156/203337114487263232/2023/3/7/photo1678154031397-1678154031527819122980.jpg'
    })
    Img: string;

    @ApiProperty({
        type: Date,
        example: '2023-03-08 00:00:00'
    })
    Date: Date | any;

    constructor(data?: StockNewsResponse | any) {
        this.TickerInNews = data?.TickerInNews ? data?.TickerInNews.split(', ') : '[]';
        this.Title = data?.Title || '';
        this.Href = data?.Href || '';
        this.Img = data?.Img || '';
        this.Date = UtilCommonTemplate.toDateTime(data?.Date || new Date())

    }

    public mapToList(data?: StockNewsResponse[] | any[]) {
        return data.map((i) => new StockNewsResponse(i))
    }
}

export class StockNewsSwagger extends PartialType(BaseResponse) {
    @ApiProperty({
        type: StockNewsResponse,
        isArray: true,
    })
    data: StockNewsResponse[];
}
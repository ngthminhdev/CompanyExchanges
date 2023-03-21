import {ApiProperty} from '@nestjs/swagger';
import {DomesticIndexKafkaInterface} from "../../kafka/interfaces/domestic-index-kafka.interface";

export class MarketVolatilityKafkaResponse {
    @ApiProperty({
        type: String,
        description: 'Mã sàn chứng khoán',
        example: 'VN30',
    })
    ticker: string;

    @ApiProperty({
        type: Number,
        description: 'Tỷ lệ thay đổi so với phiên trước',
        example: '-1',
    })
    day_change_percent: number;

    @ApiProperty({
        type: Number,
        description: 'Tỷ lệ thay đổi trung bình tuần ',
        example: '0.4',
    })
    week_change_percent: number;

    @ApiProperty({
        type: Number,
        description: 'Tỷ lệ thay đổi trung bình tháng',
        example: '2',
    })
    month_change_percent: number;

    @ApiProperty({
        type: Number,
        description: 'Tỷ lệ thay đổi trung bình năm',
        example: '-5',
    })
    year_change_percent: number;

    constructor(data?: DomesticIndexKafkaInterface) {
        this.ticker = data?.name || "";
        this.day_change_percent = data?.["%1D"] ? +data?.["%1D"].slice(0, data?.["%1D"].length - 1) : 0;
        this.week_change_percent = data?.["%5D"] ? +data?.["%5D"].slice(0, data?.["%5D"].length - 1) : 0;
        this.month_change_percent = data?.["%MTD"] ? +data?.["%MTD"].slice(0, data?.["%MTD"].length - 1) : 0;
        this.year_change_percent = data?.["%YTD"] ? +data?.["%YTD"].slice(0, data?.["%YTD"].length - 1) : 0;
    }

    public mapToList(data?: any[]) {
        return data?.map((item) => new MarketVolatilityKafkaResponse(item));
    }
}

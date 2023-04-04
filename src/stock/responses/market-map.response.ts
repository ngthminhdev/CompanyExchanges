import { ApiProperty, PartialType } from '@nestjs/swagger';
import { BaseResponse } from '../../utils/utils.response';

export class MarketMapResponse {
    @ApiProperty({
        type: String,
    })
    global: string;

    @ApiProperty({
        type: String,
    })
    industry: string;

    @ApiProperty({
        type: String,
    })
    ticker: string;

    @ApiProperty({
        type: 'float',
        example: 99.99,
    })
    value: number;

    constructor(data?: any) {
        this.global = data?.global || '';
        this.industry = data?.industry || '';
        this.ticker = data?.ticker || '';
        this.value = data?.value || 0;
    }

    public mapToList(data?: any[]) {
        return data.map((item) => new MarketMapResponse(item));
    }
}

export class MarketMapSwagger extends PartialType(BaseResponse) {
    @ApiProperty({
        type: MarketMapResponse,
        isArray: true,
    })
    data: MarketMapResponse[];
}

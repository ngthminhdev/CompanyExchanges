import {ApiProperty, ApiResponseProperty, PartialType} from "@nestjs/swagger";
import {BaseResponse} from "../../utils/utils.response";
import {UtilCommonTemplate} from "../../utils/utils.common";
import {VnIndexInterface} from "../../kafka/interfaces/vnindex.interface";
import { TransactionTimeTypeEnum } from "../../enums/common.enum";


export class VnIndexResponse {
    @ApiProperty({
        type: Number,
        description: '0 - phiên hiện tại (realtime), 1 - 5 phiên, 2 - 1 tháng, 3 - YtD'
    })
    type: number;

    @ApiResponseProperty({
        type: String,
    })
    comGroupCode: string;

    @ApiResponseProperty({
        type: Number
    })
    indexValue: number;

    @ApiResponseProperty({
        type: Number
    })
    tradingDate: number;

    @ApiResponseProperty({
        type: Number
    })
    indexChange: number;

    @ApiResponseProperty({
        type: Number
    })
    percentIndexChange: number;

    @ApiResponseProperty({
        type: Number
    })
    referenceIndex: number;

    @ApiResponseProperty({
        type: Number
    })
    openIndex: number;

    @ApiResponseProperty({
        type: Number
    })
    closeIndex: number;

    @ApiResponseProperty({
        type: Number
    })
    highestIndex: number;

    @ApiResponseProperty({
        type: Number
    })
    lowestIndex: number;

    @ApiResponseProperty({
        type: Number
    })
    matchVolume: number;

    @ApiResponseProperty({
        type: Number
    })
    matchValue: number;

    @ApiResponseProperty({
        type: Number
    })
    totalMatchVolume: number;

    @ApiResponseProperty({
        type: Number
    })
    totalMatchValue: number;

    constructor(data?: VnIndexInterface) {
        this.type = data?.type || 0;
        this.comGroupCode = data?.comGroupCode || "";
        this.indexValue = data?.indexValue || 0;
        this.tradingDate = data?.type === TransactionTimeTypeEnum.Latest
        // ?   Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), +UtilCommonTemplate.toTime(data?.tradingDate).split(":")[0], +UtilCommonTemplate.toTime(data?.tradingDate).split(":")[1]).valueOf()
            ?   Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), +UtilCommonTemplate.toTime(data?.tradingDate)?.split(":")![0] || new Date().getHours(), +UtilCommonTemplate.toTime(data?.tradingDate)?.split(":")![1] || new Date().getMinutes()).valueOf()
            :   UtilCommonTemplate.toDateNumberUTC(data?.tradingDate || new Date());
        this.indexChange = data?.indexChange || 0;
        this.percentIndexChange = data?.percentIndexChange || 0;
        this.referenceIndex = data?.referenceIndex || 0;
        this.openIndex = data?.openIndex || 0;
        this.closeIndex = data?.closeIndex || 0;
        this.highestIndex = data?.highestIndex || 0;
        this.lowestIndex = data?.lowestIndex || 0;
        this.matchVolume = data?.matchVolume || 0;
        this.matchValue = data?.matchValue || 0;
        this.totalMatchVolume = data?.totalMatchVolume || 0;
        this.totalMatchValue = data?.totalMatchValue || 0;
    }

    public mapToList(data?: VnIndexInterface[], type: number = 0) {
        return data.map(i => new VnIndexResponse({...i, type: type}))
    }
}

export class VnIndexSwagger extends PartialType(BaseResponse) {
    @ApiProperty({
        type: VnIndexResponse,
        isArray: true,
    })
    data: VnIndexResponse[];
}
import {ApiProperty, ApiResponseProperty, PartialType} from "@nestjs/swagger";
import {BaseResponse} from "../../utils/utils.response";
import {UtilCommonTemplate} from "../../utils/utils.common";
import {VnIndexInterface} from "../../kafka/interfaces/vnindex.interface";


export class VnIndexResponse {
    @ApiResponseProperty({
        type: String,
    })
    comGroupCode: string;

    @ApiResponseProperty({
        type: String
    })
    indexValue: number;

    @ApiResponseProperty({
        type: String
    })
    tradingDate: number;

    @ApiResponseProperty({
        type: String
    })
    indexChange: number;

    @ApiResponseProperty({
        type: String
    })
    percentIndexChange: number;

    @ApiResponseProperty({
        type: String
    })
    referenceIndex: number;

    @ApiResponseProperty({
        type: String
    })
    openIndex: number;

    @ApiResponseProperty({
        type: String
    })
    closeIndex: number;

    @ApiResponseProperty({
        type: String
    })
    highestIndex: number;

    @ApiResponseProperty({
        type: String
    })
    lowestIndex: number;

    @ApiResponseProperty({
        type: String
    })
    matchVolume: number;

    @ApiResponseProperty({
        type: String
    })
    matchValue: number;

    @ApiResponseProperty({
        type: String
    })
    totalMatchVolume: number;

    @ApiResponseProperty({
        type: String
    })
    totalMatchValue: number;

    constructor(data?: VnIndexInterface) {
        this.comGroupCode = data?.comGroupCode || "";
        this.indexValue = data?.indexValue || 0;
        this.tradingDate = UtilCommonTemplate.toDateNumber(data?.tradingDate || new Date());
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

    public mapToList(data?: VnIndexInterface[] | any[]) {
        return data.map(i => new VnIndexResponse(i))
    }
}

export class VnIndexSwagger extends PartialType(BaseResponse) {
    @ApiProperty({
        type: VnIndexResponse,
        isArray: true,
    })
    data: VnIndexResponse[];
}
export interface VnIndexInterface {
    type?: number;
    comGroupCode: string;
    indexValue: number;
    tradingDate: number;
    indexChange: number;
    percentIndexChange: number;
    referenceIndex: number;
    openIndex: number;
    closeIndex: number;
    highestIndex: number;
    lowestIndex: number;
    matchVolume: number;
    matchValue: number;
    totalMatchVolume: number;
    totalMatchValue: number;
}
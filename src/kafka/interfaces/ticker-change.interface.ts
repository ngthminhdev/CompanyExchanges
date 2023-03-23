export interface TickerChangeInterface {
    ticker: string,
    name: string,
    price: number,
    lastUpdated: Date | string,
    "1D": number,
    "%1D": number,
    "5D": number,
    "%5D": number,
    MTD: number,
    "%MTD": number,
    YTD: number,
    "%YTD": number;
}
export interface ExchangeValueInterface {
    exchange: number;
}

export interface TickerByExchangeInterface {
    ticker: string;
    exchange: string;
    value: number;
    industry: string;
    value_change_percent: number;
}
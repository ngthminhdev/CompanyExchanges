export interface DomesticIndexInterface {
    ticker: string;
    date_time: Date | string;
    close_price: number;
    value: number;
    volume: number;
    net_value_foreign: number;
    change_price: number;
    percent_d: number
}
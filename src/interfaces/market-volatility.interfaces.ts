export interface MarketVolatilityInterface {
    ticker: string;
    date_time: string;
    open_price: number;
    close_price: number;
    suport: number;
    strong_support: number;
    resid: number;
    percent_d: string;
    percent_w: string;
    percent_m: string;
    percent_y: string;
    foreign_total_buy: number,
    foreign_total_sell: number;
    foreign_netvol: number;
    total_value_buy: number;
    total_value_sell: number;
    net_valuue_foreign: number;
    diemsokythu: number
    danhgia: string;
    mb_ratio: number
    yyyymmdd: any;
}
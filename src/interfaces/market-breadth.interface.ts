export interface MarketBreadthInterface {
  industry: string;
  equal: number;
  high: number;
  low: number;
  increase: number;
  decrease: number;
  day_change_percent: number;
  week_change_percent: number;
  month_change_percent: number;
}

export interface MarketBreadthRawInterface {
  industry: string;
  ticker: string;
  mkt_cap: number;
  close_price: number;
  ref_price: number;
  high: number;
  low: number;
  date_time: Date | string;
  total_market_cap: number
}

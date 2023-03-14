export interface MarketVolatilityInterface {
  ticker: string;
  day_change_percent: number;
  week_change_percent: number;
  month_change_percent: number;
  year_change_percent: number;
}
export interface MarketVolatilityRawInterface {
  ticker: string;
  close_price: number;
}

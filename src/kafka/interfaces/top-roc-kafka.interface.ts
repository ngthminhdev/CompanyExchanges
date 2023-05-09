export interface TopRocKafkaInterface {
  name: string;
  price: number;
  ticker: string;
  lastUpdated: Date | string;
  '1D': number;
  '5D': number;
  '%1D': number;
  '%5D': number;
  '%MTD': number;
  '%YTD': number;
  MTD: number;
  YTD: number;
}

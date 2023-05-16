export interface InvestorTransactionRatioInterface {
  type: number;
  buyVal: number;
  sellVal: number;
  netVal: number;
  totalVal: number;
  percent: number;
  date: Date | string;
}

export interface InvestorCashFlowByIndustryInterface {
  industry: string;
  buyVal: number;
  sellVal: number;
  netVal: number;
  transVal: number;
  type: number;
  date: Date | string;
  marketTotalVal: number;
  percent: number;
}

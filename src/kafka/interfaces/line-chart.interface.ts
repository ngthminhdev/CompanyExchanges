export interface LineChartInterface {
  type?: number;
  date?: string;
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
export interface LineChartInterfaceV2 {
  code: string
  floor: string
  date: string
  time: string
  type: string
  openPrice: number
  highPrice: number
  lowPrice: number
  closePrice: number
  change: number
  perChange: number
  totalVol: number
  totalVal: number
  omVol: number
  omVal: number
  ptVol: number
  ptVal: number
  advances: number
  declines: number
  noChange: number
  noTrade: number
  ceilingStocks: number
  floorStocks: number
  id: string
  timeInday: string
}

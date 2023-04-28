export interface MarketCashFlowInterface {
  code: string;
  index: string;
  lastPrice: number;
  changePrice1d: number;
  changePrice1dPct: number;
  accumulatedVal: number;
  changeVol20p: number;
  avgVol20p: number;
  changeVolPt1p: number;
  changeVolPt5p: number;
  avgVolTT20p: number;
  lastUpdated: number;
  totalPtVol5p: number;
  avgPtVal5p: number;
}

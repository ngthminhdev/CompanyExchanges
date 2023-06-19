export interface ISPEPBIndustry {
  industry: string;
  date: Date | string;
  PB: number;
  PE: number;
}

export interface IPEIndustry {
  industry: string;
  date: Date | string;
  floor: string;
  PE: number;
}

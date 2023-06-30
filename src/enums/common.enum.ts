export enum BooleanEnum {
  False,
  True,
}

export enum TimeToLive {
  TenSeconds = 10,
  HaftMinute = 30,
  Minute = 60,
  FiveMinutes = 300,
  HaftHour = 1800,
  FiveMinutesMilliSeconds = 300000,
  OneHour = 3600,
  OneDay = 86400,
  OneDayMilliSeconds = 86400000,
  OneWeek = 604800,
  OneWeekMilliSeconds = 604800000,
  OneYear = 31556926,
  Forever = -1,
}

export enum TransactionTimeTypeEnum {
  Latest,
  OneWeek,
  OneMonth,
  YearToDate,
  OneQuarter,
  YearToYear,
}

export enum QuarterTimeTypeEnum {
  Two = 2,
  Four = 4,
  Eight = 8,
  Twelve = 12,
  TwentyFive = 20,
}

export enum TimeTypeEnum {
  Quarter,
  Year,
  Month,
}

export enum InvestorTypeEnum {
  Foreign,
  Proprietary,
  Retail,
  All,
}

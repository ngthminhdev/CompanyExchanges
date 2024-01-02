export enum RedisKeys {
  Industry = 'industry',
  MarketVolatility = 'market-volatility',
  MarketBreadth = 'market-breadth',
  NetTransactionValue = 'net-transaction-value',
  MarketLiquidity = 'market-liquidity',
  ExchangeVolume = 'exchange-volume',
  StockNews = 'stock-news',
  StockMacroNews = 'stock-macro-news',
  StockEvents = 'stock-events',
  DomesticIndex = 'domestic-index',
  InternationalIndex = 'international-index',
  TopNetForeign = 'top-net-foreign',
  TopNetForeignByEx = 'top-net-foreign-by-ex',
  NetForeign = 'net-foreign',
  TopRoc5 = 'top-roc-5',
  MerchandisePrice = 'merchandise-price',
  User = 'user',
  HNX = 'hnx-ticker',
  HOSE = 'hsx-ticker',
  UPCoM = 'upcom-ticker',
  Rsi = 'rsi',
  MarketEvaluation = 'market-evaluation',
  LineChart = 'line-chart',
  IndustryFull = 'industry-full',
  MarketMap = 'market-map',
  LiquidityContribute = 'liquidity-contribute',
  TickerContribute = 'ticker-contribute',
  TickerIndustry = 'ticker-industry',
  TickerPrice = 'ticker-price',

  InvestorTransaction = 'investor-transaction',
  CashFlowValue = 'cash-flow-value',

  BienDongThiTruong = 'bien-dong-thi-truong',
  KLCPLH = 'klcplh',
  MarketCap = 'market-cap',

  InvestorTransactionRatio = 'investor-transaction-ratio',
  InvestorTransactionCashFlowRatio = 'investor-transaction-cash-flow-ratio',

  TopNetBuyIndustry = 'top-net-buy-industry',
  InvestorCashFlowByIndustry = 'investor-cash-flow-by-industry',

  SessionDate = 'session-date',

  LiquidityChangePerformance = 'liquidity-change-performance',
  IndusLiquidity = 'indus-liquidity',
  marketCapChange = 'market-cap-change',

  EquityIndsChange = 'equity-inds-change',
  EquityChange = 'equity-change',

  LiabilitiesIndsChange = 'liabilities-inds-change',
  LiabilitiesChange = 'liabilities-change',

  netRevenueInds = 'net-revenue-inds',

  ProfitInds = 'profit-inds',
  ActivityProfitInds = 'activity-profit-inds',
  EPSInds = 'eps-inds',
  EBITDAInds = 'eBITDA-inds',
  CashDividend = 'cash-dividend',

  TopHotIndustry = 'top-hot-industry',

  PEPBIndustry = 'pe-pb-industry',

  PEIndustry = 'pe-industry',
  PETicker = 'pe-ticker',
  PBIndustry = 'pb-industry',
  PBTicker = 'pb-ticker',

  PayoutRatio = 'payout-ratio',
  CashRatio = 'cash-ratio',
  RotaionRatio = 'rota-ratio',

  IndsDebtSolvency = 'inds-debt-solvency',
  IndsProfitMargins = 'inds-profit-margin',
  indsProfitMarginsTable = 'inds-profit-margins-table',

  IndsInterestCoverage = 'inds-coverage',
  
  interestRatesOnLoans = 'interest-rates-on-loans',
  netProfitMarginByIndustries = 'net-profit-margin-by-industries',

  NearestDate = 'nearest-date',

  //Vi mo
  industryGDPValue = 'industry-GDP-value',
  gdpPrice = 'gdp-price',
  idustryGDPContibute = 'idustry-GDP-contibute',
  idustryGDPGrowth = 'idustry-GDP-growth',
  idustryGDPGrowthPercent = 'idustry-GDP-growth-percent',

  //CPI
  idustryCPIPercent = 'idustry-CPIPercent',
  idustryCPITable = 'idustry-CPITable',
  idustryCPISameQuater = 'idustry-CPISameQuater',
  idustryCPIChange = 'idustry-CPI-change',
  cpiQuyenSo = 'cpi-quyen-so',

  //IPP
  industrialIndex = 'idustry-industrial-index',
  industrialIndexTable = 'idustry-industrial-index-table',
  ippConsumAndInventory = 'ipp-consum-and-inventory',
  ippMostIndusProduction = 'ipp-most-indus-production',
  ippIndusProductionIndex = 'ipp-indus-production-index',

  //Bán lẻ
  retailValue = 'retail-value',
  retailValueTotal = 'retail-value-total',
  retailPercentValue = 'retail-percent-value',
  exportImport = 'export-import',
  exportImportMain = 'export-import-main',
  exportImportMainMH = 'export-import-main-mh',
  importMainMH = 'import-main-mh',
  mapImportMain = 'map-import-main',

  //Lao động
  laborForce = 'labor-force',
  unemployedRate = 'unemployed-rate',
  laborRate = 'labor-rate',
  informalLaborRate = 'informal-labor-rate',
  averageSalary = 'average-salary',
  employmentFluctuations = 'employment-fluctuations',

  //Tín dụng
  totalPayment = 'total-payment',
  totalPaymentPercent = 'total-payment-percent',
  balancePaymentInternational = 'balance-payment-international',
  creditDebt = 'credit-debt',
  creditDebtPercent = 'credit-debt-percent',
  creditInstitution = 'credit-institution',

  //FDI
  totalInvestmentProjects = 'total-investment-projects',
  foreignInvestmentIndex = 'foreign-investment-index',
  accumulated = 'accumulated',
  totalRegisteredAndDisbursed = 'total-registered-disbursed',

  //Tin tuc
  newsEvent = 'news-event',
  newsEnterprise = 'news-enterprise',
  newsFilter = 'news-filter',
  infoStock = 'info-stock',

  //Trái phiếu
  corporateBondsIssuedSuccessfully = 'corporate-bonds-issued',
  averageDepositInterestRate = 'average-deposit-interest-rate',
  totalOutstandingBalance = 'total-outstanding-balance',
  estimatedValueOfCorporateBonds = 'estimated-value-of-corporate-bonds',
  listOfBondsToMaturity = 'list-of-bonds-to-maturity',
  listOfEnterprisesWithLateBond = 'list-of-enterprises-with-late-bond',
  structureOfOutstandingDebt = 'structure-of-outstanding-debt',
  proportionOfOutstandingLoansOfEnterprises = 'proportion-of-outstanding-loans-of-enterprises',

  //Ty gia va lai suat
  centralExchangeRate = 'central-exchange-rate',
  exchangeRateIndexTable = 'exchange-rate-index-table',
  interestRate = 'interest-rate',
  exchangeRateAndInterestRate = 'exchange-rate-and-interest-rate',
    
  //Filter
  filter = 'filter',

  //Report
  reportIndex = 'report-index',

  //Co phieu
  transactionStatistics = 'transaction-statistics',
  businessResults = 'business-results',
  balanceSheet = 'balance-sheet',
  castFlow = 'cast-flow',
  financialIndicators = 'financial-indicators',
  enterprisesSameIndustry = 'enterprisesS-same-industry',
  eventCalendar = 'event-calendar',
  headerStock = 'header-stock',
  transactionData = 'transaction-data',
  tradingPriceFluctuations = 'trading-price-fluctuations',
  averageTradingVolume = 'average-trading-volume',
  statisticsMonthQuarterYear = 'statistics-month-quarter-year',
  tradingGroupsInvestors = 'trading-groups-investors',
  newsStock = 'news-stock',
  castFlowDetail = 'cast-flow-detail',
  businessResultDetail = 'business-result-detail',
  balanceSheetDetail = 'balance-sheet-detail',
  balanceSheetDetailCircle = 'balance-sheet-detail-circle',
  financialIndicatorsDetail = 'financial-indicators-detail',
  valuationRating = 'valuation-rating',
  financialHealthRating = 'financial-health-rating',
  financialHealthRatingAll = 'financial-health-rating-all',
  tyLeCoTucTienMat = 'ty-le-co-tuc-tien-mat',
  businessPositionRating = 'business-position-rating',
  techniqueRating = 'technique-rating',
  businessRating = 'business-rating',
  individualInvestorBenefitsRating = 'individual-investor-benefits-rating',
  headerRating = 'header-rating',
  canslimPrefilter = 'canslim-prefilter',

  //Công cụ đầu tư
  minMaxFilter = 'min-max-filter',

  //Tin sáng
  morningNewsInternational = 'morning-news-international',
  morningNewsDomestic = 'morning-news-domestic',
  morningNewsEnterprise = 'morning-news-enterprise',
  saveIdentifyMarket = 'save-identify-market',
  saveStockRecommend = 'save-stock-recommend',
  saveStockSellRecommend = 'save-stock-sell-recommend',

  //Tin chiều
  saveMarketMovements = 'save-market-movements',
  saveMarketWeekComment = 'save-market-week-comment',
  saveMarketComment = 'save-market-comment'
}

export class TradingPriceFluctuationsResponse {
    min_price: number
    max_price: number
    p_week: number
    p_month: number
    p_quarter: number
    p_year: number

    constructor(data?: TradingPriceFluctuationsResponse) {
        this.min_price = data?.min_price || 0
        this.max_price = data?.max_price || 0
        this.p_week = data?.p_week || 0
        this.p_month = data?.p_month || 0
        this.p_quarter = data?.p_quarter || 0
        this.p_year = data?.p_year || 0
    }
}
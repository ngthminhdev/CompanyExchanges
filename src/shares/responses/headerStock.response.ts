export class HeaderStockResponse {
    code: string
    exchange: string
    industry: string
    company: string
    company_eng: string
    summary: string
    closePrice: number
    change: number
    perChange: number
    kldg: number
    p_week: number
    p_month: number
    p_year: number
    pb: number
    pe: number
    vh: number
    roaa: number
    roae: number
    image: string
    price: number

    constructor(data?: HeaderStockResponse) {
        this.code = data?.code || ''
        this.exchange = data?.exchange || ''
        this.industry = data?.industry || ''
        this.company = data?.company || ''
        this.company_eng = data?.company_eng || ''
        this.summary = data?.summary || ''
        this.closePrice = data?.price || 0
        this.change = data?.change || 0
        this.perChange = data?.perChange || 0
        this.kldg = data?.kldg || 0
        this.p_week = data?.p_week || 0
        this.p_month = data?.p_month || 0
        this.p_year = data?.p_year || 0
        this.pb = data?.pb || 0
        this.pe = data?.pe || 0
        this.vh = data?.vh || 0
        this.roaa = data?.roaa || 0
        this.roae = data?.roae || 0
        this.image = `/resources/stock/${data?.code}_${data?.exchange == 'VNINDEX' ? 'HOSE' : data.exchange}.jpg`
    }
}
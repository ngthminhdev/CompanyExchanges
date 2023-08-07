export class BalanceSheetDetailCircleResponse {
    name: string
    value: number
    date: string

    constructor(data?: BalanceSheetDetailCircleResponse) {
        if (data.name == 'no phai tra') this.name = 'Nợ phải trả trên tổng nguồn vốn (%)'
        if (data.name == 'von chu so huu') this.name = 'Vốn chủ sở hữu trên tổng nguồn vốn (%)'
        if (data.name == 'ngan han') this.name = 'Tài sản tài chính ngắn hạn (%)'
        if (data.name == 'dai han') this.name = 'Tài sản tài chính dài hạn (%)'
        if (data.name == 'tong nguon von') this.name = 'Tổng nguồn vốn'
        this.value = data?.value || 0
        this.date = data?.date.toString() || ''
    }

    static mapToList(data?: BalanceSheetDetailCircleResponse[]) {
        return data.map(item => new BalanceSheetDetailCircleResponse(item))
    }
}
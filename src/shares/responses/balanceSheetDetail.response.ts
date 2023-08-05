export class BalanceSheetDetailResponse {
    date: string
    value: number
    name: string
    color: any

    constructor(data?: BalanceSheetDetailResponse, is_chart?: number, type?: string) {
        this.name = data?.name || ''
        this.value = data?.value || 0
        this.date = data?.date ? data.date.toString() : ''
        this.color = is_chart ? { // Thêm thuộc tính color ở đây
            linearGradient: {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 1,
            },
            stops: [
                [0, 'rgba(57,234,202,1)'],
                [0.2, 'rgba(44,185,185,1)'],
                [0.4, 'rgba(48,153,198,1)'],
                [0.61, 'rgba(54,90,185,1)'],
                [0.78, 'rgba(49,23,201,1)'],
            ],
        } : {}
        if(is_chart){
            if(data.name == 'TỔNG CỘNG TÀI SẢN' ||
            data.name == 'NỢ PHẢI TRẢ' ||
            data.name == 'NGUỒN VỐN CHỦ SỞ HỮU' ||
            data.name == 'LỢI ÍCH CỔ ĐÔNG THIỂU SỐ' ||
            data.name == 'VỐN CHỦ SỞ HỮU'
            ) this.name = data.name.toLowerCase().charAt(0).toUpperCase() + data.name.slice(1).toLowerCase()
            if(data.name == 'no phai tra') this.name = 'Nợ phải trả trên tổng nguồn vốn (%)'
            if(data.name == 'von so huu') this.name = 'Vốn chủ sở hữu trên tổng nguồn vốn (%)'
            if(data.name == 'ngan han') this.name = 'Tài sản tài chính ngắn hạn (%)'
            if(data.name == 'dai han') this.name = 'Tài sản tài chính dài hạn (%)'
        }
        else {
            switch (type) {
                case 'Bảo hiểm':
                    if(data.name == 'Tài sản lưu động và đầu tư ngắn hạn' ||
                    data.name == 'Tài sản cố định và đầu tư dài hạn'
                    ) this.name = data.name.toUpperCase()
                    break;
                default:
                    if(data.name == 'Tài sản lưu động và đầu tư ngắn hạn' ||
                    data.name == 'Tài sản cố định và đầu tư dài hạn' ||
                    data.name == 'Nợ phải trả' || 
                    data.name == 'Nguồn vốn chủ sở hữu'
                    ) this.name = data.name.toUpperCase()
                    break;
            }
        }
    }

    static mapToList(data?: BalanceSheetDetailResponse[], is_chart?: number, type?: string) {
        return data.map(item => new BalanceSheetDetailResponse(item, is_chart, type))
    }
}
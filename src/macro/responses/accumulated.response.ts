import { UtilCommonTemplate } from "../../utils/utils.common"

export class AccumulatedResponse {
    name: string
    date: string
    luy_ke: number
    luy_ke_von: number
    color: string

    constructor(data?: AccumulatedResponse) {
        this.name = data?.name || ''
        this.date = data?.date ? UtilCommonTemplate.toDate(data.date) : ''
        this.luy_ke = data?.luy_ke || 0
        this.luy_ke_von = data?.luy_ke_von || 0
        switch (data?.name) {
            case 'Công nghiệp chế biến, chế tạo':
                this.color = '#AAFAFF'
                break;
            case 'Sản xuất, phân phối điện, khí, nước, điều hòa':
                this.color = '#8C52FF'
                break;
            case 'Hoạt động kinh doanh bất động sản':
                this.color = '#5E17EB'
                break;
            case 'Xây dựng':
                this.color = '#0097B2'
                break;
            case 'Bán buôn và bán lẻ; sửa chữa ô tô, mô tô, xe máy':
                this.color = '#0CC0DF'
                break;
            case 'Nông nghiêp, lâm nghiệp và thủy sản':
                this.color = '#5CE1E6'
                break;
            case 'Hoạt động chuyên môn, khoa học công nghệ':
                this.color = '#38B6FF'
                break;
            case 'Vận tải kho bãi':
                this.color = '#5271FF'
                break;
            case 'Thông tin và truyền thông':
                this.color = '#86BAFF'
                break;
            case 'Dịch vụ lưu trú và ăn uống':
                this.color = '#27648B'
                break;
            case 'Hoạt động hành chính và dịch vụ hỗ trợ':
                this.color = '#645FC6'
                break;
            case 'Hoạt động dịch vụ khác':
                this.color = '#73ACBB'
                break;
            case 'Giáo dục và đào tạo':
                this.color = '#68DBE1'
                break;
            case 'Cấp nước và xử lý chất thải':
                this.color = '#6970CD'
                break;
            case 'Y tế và hoạt động trợ giúp xã hội':
                this.color = '#5AA0CD'
                break;
            case 'Khai khoáng':
                this.color = '#4A59A7'
                break;
            case 'Nghệ thuật, vui chơi và giải trí':
                this.color = '#516EEB'
                break;
            case 'Hoạt động tài chính, ngân hàng và bảo hiểm':
                this.color = '#23A2D1'
                break;
            case 'Hoạt đông làm thuê các công việc trong các hộ gia đình':
                this.color = '#2AB6AE'
                break;
            default:
                this.color = ''
                break;
        }
    }

    static mapToList(data?: AccumulatedResponse[]) {
        return data.map(item => new AccumulatedResponse(item))
    }
}
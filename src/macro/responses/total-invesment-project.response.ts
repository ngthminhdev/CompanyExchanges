import { UtilCommonTemplate } from "../../utils/utils.common"

export class TotalInvestmentProjectsResponse {
    name: string
    value: number
    date: string
    color: string

    constructor(data?: TotalInvestmentProjectsResponse) {
        switch (data.name) {
            case 'CM':
                this.name = 'Dự án cấp mới'
                this.color = '#3CD8C5'
                break;
            case 'TV':
                this.name = 'Dự án tăng vốn'
                this.color = '#38B6FF'
                break;
            case 'GV':
                this.name = 'Góp vốn, mua cổ phần'
                this.color = '#5271FF'
                break;
            default:
                break;
        }
        this.value = data?.value || 0
        this.date = data?.date ? UtilCommonTemplate.toDate(data.date) : ''
    }

    static mapToList(data?: TotalInvestmentProjectsResponse[]) {
        return data.map(item => new TotalInvestmentProjectsResponse(item))
    }
}
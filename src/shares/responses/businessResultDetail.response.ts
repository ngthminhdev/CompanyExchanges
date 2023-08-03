export class BusinessResultDetailResponse {
    name: string
    value: number
    per: number
    date: string

    constructor(data?: BusinessResultDetailResponse) {
        this.name = data?.name || ''
        this.value = data?.value || 0
        this.per = data?.per || 0
        this.date = data?.date ? data.date.toString() : ''
    }

    static mapToList(data?: BusinessResultDetailResponse[]) {
        return data.map(item => new BusinessResultDetailResponse(item))
    }
}
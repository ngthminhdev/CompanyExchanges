export class IndusInterestCoverageResponse {
    industry: string
    date: string
    value: number

    constructor(data?: IndusInterestCoverageResponse){
        this.industry = data?.industry || ''
        this.date = data?.date || ''
        this.value = data?.value || 0
    }

    static mapToList(data: IndusInterestCoverageResponse[]){
        return data.map(item => new IndusInterestCoverageResponse(item))
    }
}
export class CastFlowDetailResponse {
    date: string
    value: number
    name: string

    constructor(data?: CastFlowDetailResponse){
        if(data?.name == 'Lưu chuyển tiền từ hoạt động kinh doanh' || 
        data?.name == 'Lưu chuyển tiền từ hoạt động đầu tư' ||
        data?.name =='Lưu chuyển tiền thuần trong kỳ' ||
        data?.name =='Tiền và tương đương tiền đầu kỳ' ||
        data?.name == 'Tiền và tương đương tiền cuối kỳ' ||
        data?.name == 'Lưu chuyển tiền từ hoạt động đầu tư' ||
        data?.name == 'Lưu chuyển tiền từ hoạt động tài chính' ||
        data?.name == 'Ảnh hưởng của thay đổi tỷ giá hối đoái quy đổi ngoại tệ' ||
        data?.name == 'Tăng/giảm tiền thuần trong kỳ' ||
        data?.name == 'Tiền và các khoản tương đương tiền đầu kỳ' ||
        data?.name == 'Tiền và các khoản tương đương tiền cuối kỳ'
        ){
            this.name = data?.name ? data.name.toUpperCase() : ''
        }else {
            this.name = data?.name || ''  
        }
        this.value = data?.value || 0
        this.date = data?.date ? data?.date.toString() : ''
    }

    static mapToList(data?: CastFlowDetailResponse[], is_chart?: number){
         return data.map(item => new CastFlowDetailResponse({...item, name: is_chart ? item.name.toUpperCase() : item.name}))
    }
}
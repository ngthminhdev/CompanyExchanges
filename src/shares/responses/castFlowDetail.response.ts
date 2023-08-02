export class CastFlowDetailResponse {
    date: string
    value: number
    name: string

    constructor(data?: CastFlowDetailResponse, type?: string) {
        switch (type) {
            case 'Ngân hàng':
                this.name = data?.name == 'Lưu chuyển tiền từ hoạt động kinh doanh' ||
                    data?.name == 'Lưu chuyển tiền từ hoạt động đầu tư' ||
                    data?.name == 'Lưu chuyển tiền thuần trong kỳ' ||
                    data?.name == 'Tiền và tương đương tiền đầu kỳ' ||
                    data?.name == 'Tiền và tương đương tiền cuối kỳ' ?
                    data.name.toUpperCase() : data?.name
                break;
            case 'Bảo hiểm':
                this.name = data?.name == 'Lưu chuyển tiền từ hoạt động kinh doanh' ||
                    data?.name == 'Lưu chuyển tiền từ hoạt động đầu tư' ||
                    data?.name == 'Lưu chuyển tiền từ hoạt động tài chính' ||
                    data?.name == 'Lưu chuyển tiền thuần trong kỳ' ||
                    data?.name == 'Tiền và tương đương tiền đầu kỳ' ||
                    data?.name == 'Tiền và tương đương tiền cuối kỳ' ||
                    data?.name == 'Ảnh hưởng của thay đổi tỷ giá hối đoái quy đổi ngoại tệ' ||
                    data?.name == 'Tiền và tương đương tiền cuối kỳ' ?
                    data.name.toUpperCase() : data?.name
                break
            case 'Dịch vụ tài chính':
                this.name = data?.name == 'Lưu chuyển tiền từ hoạt động kinh doanh' ||
                    data?.name == 'Lưu chuyển tiền từ hoạt động đầu tư' ||
                    data?.name == 'Lưu chuyển tiền từ hoạt động tài chính' ||
                    data?.name == 'Tăng/giảm tiền thuần trong kỳ' ||
                    data?.name == 'Tiền và các khoản tương đương tiền đầu kỳ' ||
                    data?.name == 'Tiền và tương đương tiền cuối kỳ' ||
                    data?.name == 'Tiền gửi ngân hàng cuối kỳ'  ?
                    data.name.toUpperCase() : data?.name
                if(data.name == 'Cac khoan tuong duong tien dau ky') this.name = 'Các khoản tương đương tiền đầu kỳ'   
                if(data.name == 'Cac khoan tuong duong tien cuoi ky') this.name = 'Các khoản tương đương tiền cuối kỳ'   
                if(data.name == 'Anh huong dau ky') this.name = 'Ảnh hưởng của thay đổi tỷ giá hối đoái quy đổi ngoại tệ đầu kỳ'   
                if(data.name == 'Anh huong cuoi ky') this.name = 'Ảnh hưởng của thay đổi tỷ giá hối đoái quy đổi ngoại tệ cuối kỳ'   
                break

            default:
                this.name = data?.name == 'Lưu chuyển tiền từ hoạt động kinh doanh' ||
                    data?.name == 'Lưu chuyển tiền từ hoạt động đầu tư' ||
                    data?.name == 'Lưu chuyển tiền từ hoạt động tài chính' ||
                    data?.name == 'Lưu chuyển tiền thuần trong kỳ' ||
                    data?.name == 'Tiền và tương đương tiền đầu kỳ' ||
                    data?.name == 'Ảnh hưởng của thay đổi tỷ giá hối đoái quy đổi ngoại tệ' ||
                    data?.name == 'Tiền và tương đương tiền cuối kỳ'  ?
                    data.name.toUpperCase() : data?.name
                break;
        }

        this.value = data?.value || 0
        this.date = data?.date ? data?.date.toString() : ''
    }

    static mapToList(data?: CastFlowDetailResponse[], is_chart?: number, type?: string) {
        return data.map(item => new CastFlowDetailResponse({ ...item, name: is_chart ? item.name.toUpperCase() : item.name }, type))
    }
}
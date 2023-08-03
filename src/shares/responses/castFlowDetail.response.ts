export class CastFlowDetailResponse {
    date: string
    value: number
    name: string
    color: any

    constructor(data?: CastFlowDetailResponse, type?: string, is_chart?: number) {
        switch (type) {
            case 'Ngân hàng':
                this.name = data?.name == 'Lưu chuyển tiền từ hoạt động kinh doanh' ||
                    data?.name == 'Lưu chuyển tiền từ hoạt động đầu tư' ||
                    data?.name == 'Lưu chuyển tiền thuần trong kỳ' ||
                    data?.name == 'Tiền và tương đương tiền đầu kỳ' ||
                    data?.name == 'Tiền và tương đương tiền cuối kỳ' ?
                    data.name.toUpperCase() : data?.name
                this.color = is_chart ? {
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
                this.color = is_chart ? {
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
                break
            case 'Dịch vụ tài chính':
                this.name = data?.name == 'Lưu chuyển tiền từ hoạt động kinh doanh' ||
                    data?.name == 'Lưu chuyển tiền từ hoạt động đầu tư' ||
                    data?.name == 'Lưu chuyển tiền từ hoạt động tài chính' ||
                    data?.name == 'Tăng/giảm tiền thuần trong kỳ' ||
                    data?.name == 'Tiền và các khoản tương đương tiền đầu kỳ' ||
                    data?.name == 'Tiền và tương đương tiền cuối kỳ' ||
                    data?.name == 'Tiền gửi ngân hàng cuối kỳ' ?
                    data.name.toUpperCase() : data?.name
                if (data.name == 'Cac khoan tuong duong tien dau ky') this.name = 'Các khoản tương đương tiền đầu kỳ'
                if (data.name == 'Cac khoan tuong duong tien cuoi ky') this.name = 'Các khoản tương đương tiền cuối kỳ'
                if (data.name == 'Anh huong dau ky') this.name = 'Ảnh hưởng của thay đổi tỷ giá hối đoái quy đổi ngoại tệ đầu kỳ'
                if (data.name == 'Anh huong cuoi ky') this.name = 'Ảnh hưởng của thay đổi tỷ giá hối đoái quy đổi ngoại tệ cuối kỳ'
                switch (data?.name) {
                    case 'LƯU CHUYỂN TIỀN THUẦN TỪ HOẠT ĐỘNG ĐẦU TƯ':
                        this.color = is_chart ? {// Thêm thuộc tính color ở đây
                            linearGradient: {
                                x1: 0,
                                y1: 0,
                                x2: 0,
                                y2: 1,
                            },
                            stops: [
                                [0.1, 'rgba(127,90,240,1)'],
                                [0.31, 'rgba(127,90,240,1)'],
                                [0.74, 'rgba(189,172,239,1)'],
                            ],
                        } : {}
                        break;
                    case 'LƯU CHUYỂN TIỀN THUẦN TỪ HOẠT ĐỘNG KINH DOANH':
                        this.color = is_chart ? {// Thêm thuộc tính color ở đây
                            linearGradient: {
                                x1: 0,
                                y1: 0,
                                x2: 0,
                                y2: 1,
                            },
                            stops: [
                                [0.29, 'rgba(239,231,207,1)'],
                                [0.78, 'rgba(252,246,127,1)'],
                            ],
                        } : {}
                        break;
                    case 'LƯU CHUYỂN TIỀN THUẦN TỪ HOẠT ĐỘNG TÀI CHÍNH':
                        this.color = {// Thêm thuộc tính color ở đây
                            linearGradient: {
                                x1: 0,
                                y1: 0,
                                x2: 0,
                                y2: 1,
                            },
                            stops: [
                                [0, 'rgba(6,143,255,1)'],
                                [0.33, 'rgba(62,159,239,1)'],
                                [0.76, 'rgba(200,229,253,1)'],
                            ],
                        }
                        break;
                    default:
                        this.color = is_chart ? {
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
                        break;
                }
                break
            default:
                this.name = data?.name == 'Lưu chuyển tiền từ hoạt động kinh doanh' ||
                    data?.name == 'Lưu chuyển tiền từ hoạt động đầu tư' ||
                    data?.name == 'Lưu chuyển tiền từ hoạt động tài chính' ||
                    data?.name == 'Lưu chuyển tiền thuần trong kỳ' ||
                    data?.name == 'Tiền và tương đương tiền đầu kỳ' ||
                    data?.name == 'Ảnh hưởng của thay đổi tỷ giá hối đoái quy đổi ngoại tệ' ||
                    data?.name == 'Tiền và tương đương tiền cuối kỳ' ?
                    data.name.toUpperCase() : data?.name
                this.color = is_chart ? {
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
                break;
        }

        this.value = data?.value || 0
        this.date = data?.date ? data?.date.toString() : ''
    }

    static mapToList(data?: CastFlowDetailResponse[], is_chart?: number, type?: string) {
        return data.map(item => new CastFlowDetailResponse({ ...item, name: is_chart ? item.name.toUpperCase() : item.name }, type, is_chart))
    }
}
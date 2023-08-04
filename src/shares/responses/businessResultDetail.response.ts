export class BusinessResultDetailResponse {
    name: string
    value: number
    per: number
    date: string
    color: any

    constructor(data?: BusinessResultDetailResponse, is_chart?: number, type?: string) {
        switch (type) {
            case 'Ngân hàng':
                if (data.name == 'Thu nhập lãi thuần' ||
                    data.name == 'Lãi/Lỗ thuần từ hoạt động dịch vụ' ||
                    data.name == 'Lãi/Lỗ thuần từ hoạt động kinh doanh ngoại hối' ||
                    data.name == 'Lãi/Lỗ thuần từ mua bán chứng khoán kinh doanh' ||
                    data.name == 'Lãi/Lỗ thuần từ mua bán chứng khoán đầu tư' ||
                    data.name == 'Lãi/Lỗ thuần từ hoạt động khác'
                ) {
                    this.name = data.name.toUpperCase()
                } else { this.name = data.name }
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
                if (is_chart) {
                    switch (data.name) {
                        case 'DOANH THU HOẠT ĐỘNG':
                            this.color = {// Thêm thuộc tính color ở đây
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
                            }
                            break;
                        case 'CHI PHÍ HOẠT ĐỘNG':
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
                            break
                        case 'DOANH THU HOẠT ĐỘNG TÀI CHÍNH':
                            this.color = { // Thêm thuộc tính color ở đây
                                linearGradient: {
                                    x1: 0,
                                    y1: 0,
                                    x2: 0,
                                    y2: 1,
                                },
                                stops: [
                                    [0.09, 'rgba(169,234,238,1)'],
                                    [0.73, 'rgba(29,227,240,1)'],
                                ],
                            }
                            break
                        case 'CHI PHÍ TÀI CHÍNH':
                            this.color = {// Thêm thuộc tính color ở đây
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
                            }
                            break
                        default:
                            this.color = {
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
                            }
                            break;
                    }
                }else {this.color = {}}

                break
            default:
                this.name = data.name || ''
                if (is_chart) {
                    switch (data?.name) {
                        case 'Lợi nhuận gộp':
                            this.color = {// Thêm thuộc tính color ở đây
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
                            }
                            break;
                        case 'Lợi nhuận sau thuế thu nhập doanh nghiệp':
                            this.color = {// Thêm thuộc tính color ở đây
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
                            }
                            break
                        default:
                            this.color = {
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
                            }
                            break;
                    }
                } else { this.color = {} }

                break;
        }
        this.value = data?.value || 0
        this.per = data?.per || 0
        this.date = data?.date ? data.date.toString() : ''
    }

    static mapToList(data?: BusinessResultDetailResponse[], is_chart?: number, type?: string) {
        return data.map(item => new BusinessResultDetailResponse(item, is_chart, type))
    }
}

// vàng: {// Thêm thuộc tính color ở đây
//     linearGradient: {
//         x1: 0,
//             y1: 0,
//                 x2: 0,
//                     y2: 1,
//     },
//     stops: [
//         [0.29, 'rgba(239,231,207,1)'],
//         [0.78, 'rgba(252,246,127,1)'],
//     ],
// }

// xanh: {// Thêm thuộc tính color ở đây
//     linearGradient: {
//         x1: 0,
//             y1: 0,
//                 x2: 0,
//                     y2: 1,
//     },
//     stops: [
//         [0, 'rgba(6,143,255,1)'],
//         [0.33, 'rgba(62,159,239,1)'],
//         [0.76, 'rgba(200,229,253,1)'],
//     ],
// }

// xanh nhạt: { // Thêm thuộc tính color ở đây
//     linearGradient: {
//         x1: 0,
//             y1: 0,
//                 x2: 0,
//                     y2: 1,
//     },
//     stops: [
//         [0.09, 'rgba(169,234,238,1)'],
//         [0.73, 'rgba(29,227,240,1)'],
//     ],
// }

// tím: {// Thêm thuộc tính color ở đây
//     linearGradient: {
//         x1: 0,
//             y1: 0,
//                 x2: 0,
//                     y2: 1,
//     },
//     stops: [
//         [0.1, 'rgba(127,90,240,1)'],
//         [0.31, 'rgba(127,90,240,1)'],
//         [0.74, 'rgba(189,172,239,1)'],
//     ],
// }

// mặc định: {
//     linearGradient: {
//         x1: 0,
//             y1: 0,
//                 x2: 0,
//                     y2: 1,
//     },
//     stops: [
//         [0, 'rgba(57,234,202,1)'],
//         [0.2, 'rgba(44,185,185,1)'],
//         [0.4, 'rgba(48,153,198,1)'],
//         [0.61, 'rgba(54,90,185,1)'],
//         [0.78, 'rgba(49,23,201,1)'],
//     ],
// }




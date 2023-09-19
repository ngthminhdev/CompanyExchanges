interface IDinhGia {
    dinh_gia_pe: number,
    dinh_gia_pb: number,
    graham_3: number,
    graham_2: number,
    graham_1: number
}

interface IBienDongGia {
    bd_1_month: number,
    bd_dau_nam: number
}

export class HeaderRatingResponse {
    name: string
    value: number
    value_industry?: number

    static checkRSI(rsi: number){
        if(rsi > 70) return 'Giảm'
        if(rsi < 30) return 'Tăng'
        return 'Đi ngang'
    }

    static isNegativeNumber(num: number){
        return num < 0 ? 0 : num
    }

    static mapToList(dg_co_phieu: IDinhGia, dg_nganh: IDinhGia, resistance: number, support: number, rsi_14: number, rsi_200: number, bd: IBienDongGia){
         return [
            {
                name: 'Định giá theo P/E',
                value: dg_co_phieu.dinh_gia_pe,
                value_industry: dg_nganh.dinh_gia_pe
            },
            {
                name: 'Định giá theo P/B',
                value: dg_co_phieu.dinh_gia_pb,
                value_industry: dg_nganh.dinh_gia_pb
            },
            {
                name: 'Định giá Graham 1',
                value: this.isNegativeNumber(dg_co_phieu.graham_1),
                value_industry: this.isNegativeNumber(dg_nganh.graham_1)
            },
            {
                name: 'Định giá Graham 2',
                value: this.isNegativeNumber(dg_co_phieu.graham_2),
                value_industry: this.isNegativeNumber(dg_nganh.graham_2)
            },
            {
                name: 'Định giá Graham 3',
                value: this.isNegativeNumber(dg_co_phieu.graham_3),
                value_industry: this.isNegativeNumber(dg_nganh.graham_3)
            },
            {
                name: 'Tổng hợp định giá',
                value: (dg_co_phieu.dinh_gia_pe * 0.35) + (dg_co_phieu.dinh_gia_pb * 0.35) + (this.isNegativeNumber(dg_co_phieu.graham_1) * 0.05) + (this.isNegativeNumber(dg_co_phieu.graham_2) * 0.05) + (this.isNegativeNumber(dg_co_phieu.graham_3) * 0.05),
                value_industry: (dg_nganh.dinh_gia_pe * 0.35) + (dg_nganh.dinh_gia_pb * 0.35) + (this.isNegativeNumber(dg_nganh.graham_1) * 0.05) + (this.isNegativeNumber(dg_nganh.graham_2) * 0.05) + (this.isNegativeNumber(dg_nganh.graham_3) * 0.05)
            },
            {
                name: 'Kháng cự',
                value: resistance,
            },
            {
                name: 'Hỗ trợ',
                value: support,
            },
            {
                name: 'Xu hướng ngắn hạn',
                value: this.checkRSI(rsi_14),
            },
            {
                name: 'Xu hướng dài hạn',
                value: this.checkRSI(rsi_200),
            },
            {
                name: 'Biến động giá 1 tháng',
                value: bd.bd_1_month,
            },
            {
                name: 'Biến động giá từ đầu năm',
                value: bd.bd_dau_nam,
            }
         ]
    }

    
}
export class CanslimResponse {

    static mapToList(
        eps_quy: string,
        eps_nam: string,
        chenh_lech: string,
        doanh_nghiep_dau_nganh: string,
        co_dong_lon: string,
        dinh_hinh_tt: string
    ) {
        return [
            {
                name: 'Tăng trưởng EPS quý',
                value: eps_quy
            },
            {
                name: 'Tăng trưởng EPS năm',
                value: eps_nam
            },
            {
                name: 'Chênh lệch cung cầu',
                value: chenh_lech
            },
            {
                name: 'Doanh nghiệp đầu ngành',
                value: doanh_nghiep_dau_nganh
            },
            {
                name: 'Cổ đông lớn',
                value: co_dong_lon
            },
            {
                name: 'Định hình thị trường',
                value: dinh_hinh_tt
            },
            {
                name: 'Tổng hợp chỉ tiêu',
                value: this.checkTotalStar([eps_quy,
                    eps_nam,
                    chenh_lech,
                    doanh_nghiep_dau_nganh,
                    co_dong_lon,
                    dinh_hinh_tt])
            }
        ]
    }

    static checkTotalStar(arr: string[]) {
        const total = arr.reduce((acc, cur) => {
            switch (cur) {
                case 'Đạt':
                    return acc + 3
                    break;
                case 'Bình thường':
                    return acc + 2
                    break;
                case 'Không đạt':
                    return acc + 1
                    break;
                default:
                    break;
            }
        }, 0)
        if(total >= 19) return 5
        if(total >= 16 && total <= 18) return 4
        if(total >= 13 && total <= 15) return 3
        if(total >= 8 && total <= 12) return 2
        return 1
    }
}
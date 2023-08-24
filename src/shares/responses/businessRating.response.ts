import { UtilCommonTemplate } from "../../utils/utils.common";

export class BusinessRatingResponse {

    constructor(data?: BusinessRatingResponse) { }

    static mapToList(sortDoanhThu: number, sortLoiNhuan: number, sortVonHoa: number, sortTaiSan: number, sortTyTrongVonHoa: number, sortTyTrongTaiSan: number, sortGia1Thang: number, sortGia3Thang: number, sortGia6Thang: number, sortGia1Nam: number) {
        const data = [
            {
                name: 'Tăng trưởng ngành',
                value: UtilCommonTemplate.checkStarCommon(sortDoanhThu + sortLoiNhuan + sortVonHoa + sortTaiSan, 4),
                child: [
                    {
                        name: 'Tăng trưởng doanh thu',
                        value: sortDoanhThu
                    },
                    {
                        name: 'Tăng trưởng lợi nhuận',
                        value: sortLoiNhuan
                    },
                    {
                        name: 'Tăng trưởng vốn hoá',
                        value: sortVonHoa
                    },
                    {
                        name: 'Tăng trưởng tài sản',
                        value: sortTaiSan
                    }
                ]
            },
            {
                name: 'Thị trường quan tâm',
                value: UtilCommonTemplate.checkStarCommon(sortGia1Thang + sortGia3Thang + sortGia6Thang + sortGia1Nam, 4),
                child: [
                    {
                        name: 'Tỷ lệ giá trị giao dịch/TTT 1 tháng gần nhất',
                        value: sortGia1Thang
                    },
                    {
                        name: 'Tỷ lệ giá trị giao dịch/TTT 3 tháng gần nhất',
                        value: sortGia3Thang
                    },
                    {
                        name: 'Tỷ lệ giá trị giao dịch/TTT 6 tháng gần nhất',
                        value: sortGia6Thang
                    },
                    {
                        name: 'Tỷ lệ giá trị giao dịch/TTT 1 năm gần nhất',
                        value: sortGia1Nam
                    }
                ]
            },
            {
                name: 'Quy mô ngành',
                value: UtilCommonTemplate.checkStarCommon(sortTyTrongVonHoa + sortTyTrongTaiSan, 2),
                child: [
                    {
                        name: 'Tỷ trọng vốn hoá/TTT',
                        value: sortTyTrongVonHoa
                    },
                    {
                        name: 'Tỷ trọng tài sản/TTT',
                        value: sortTyTrongTaiSan
                    }
                ]
            }
        ]
        const totalStar = UtilCommonTemplate.checkStarCommon(data.reduce((acc, currentValue) => acc + currentValue.value, 0), 3)
        return {
            totalStar,
            data
        }
    }
}
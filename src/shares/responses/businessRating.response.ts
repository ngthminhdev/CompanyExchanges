import { UtilCommonTemplate } from "../../utils/utils.common";

export class BusinessRatingResponse {

    constructor(data?: BusinessRatingResponse) { }

    static mapToList(
        sortDoanhThu: number, sortLoiNhuan: number, sortVonHoa: number, sortTaiSan: number, sortTyTrongVonHoa: number, sortTyTrongTaiSan: number, sortGia1Thang: number, sortGia3Thang: number, sortGia6Thang: number, sortGia1Nam: number,
        sortDoanhThuIndustry: number, sortLoiNhuanIndustry: number, sortVonHoaIndustry: number, sortTaiSanIndustry: number, sortTyTrongVonHoaIndustry: number, sortTyTrongTaiSanIndustry: number, sortGia1ThangIndustry: number, sortGia3ThangIndustry: number, sortGia6ThangIndustry: number, sortGia1NamIndustry: number,
        sortDoanhThuAll: number, sortLoiNhuanAll: number, sortVonHoaAll: number, sortTaiSanAll: number, sortTyTrongVonHoaAll: number, sortTyTrongTaiSanAll: number, sortGia1ThangAll: number, sortGia3ThangAll: number, sortGia6ThangAll: number, sortGia1NamAll: number
        ) {
        const data = [
            {
                name: 'Tăng trưởng ngành',
                value: UtilCommonTemplate.checkStarCommonV2(sortDoanhThuIndustry + sortLoiNhuanIndustry+ sortVonHoaIndustry + sortTaiSanIndustry, 4),
                child: [
                    {
                        name: 'Tăng trưởng doanh thu',
                        value: sortDoanhThuIndustry
                    },
                    {
                        name: 'Tăng trưởng lợi nhuận',
                        value: sortLoiNhuanIndustry
                    },
                    {
                        name: 'Tăng trưởng vốn hoá',
                        value: sortVonHoaIndustry
                    },
                    {
                        name: 'Tăng trưởng tài sản',
                        value: sortTaiSanIndustry
                    }
                ]
            },
            {
                name: 'Thị trường quan tâm',
                value: UtilCommonTemplate.checkStarCommonV2(sortGia1ThangIndustry + sortGia3ThangIndustry + sortGia6ThangIndustry + sortGia1NamIndustry, 4),
                child: [
                    {
                        name: 'Tỷ lệ giá trị giao dịch/TTT 1 tháng gần nhất',
                        value: sortGia1ThangIndustry
                    },
                    {
                        name: 'Tỷ lệ giá trị giao dịch/TTT 3 tháng gần nhất',
                        value: sortGia3ThangIndustry
                    },
                    {
                        name: 'Tỷ lệ giá trị giao dịch/TTT 6 tháng gần nhất',
                        value: sortGia6ThangIndustry
                    },
                    {
                        name: 'Tỷ lệ giá trị giao dịch/TTT 1 năm gần nhất',
                        value: sortGia1NamIndustry
                    }
                ]
            },
            {
                name: 'Quy mô ngành',
                value: UtilCommonTemplate.checkStarCommonV2(sortTyTrongVonHoaIndustry + sortTyTrongTaiSanIndustry, 2),
                child: [
                    {
                        name: 'Tỷ trọng vốn hoá/TTT',
                        value: sortTyTrongVonHoaIndustry
                    },
                    {
                        name: 'Tỷ trọng tài sản/TTT',
                        value: sortTyTrongTaiSanIndustry
                    }
                ]
            }
        ]
        const totalStar = UtilCommonTemplate.checkStarCommon(data.reduce((acc, currentValue) => acc + currentValue.value, 0), 3)
        const totalStarIndustry = UtilCommonTemplate.checkStarCommon(
            UtilCommonTemplate.checkStarCommon(sortDoanhThuIndustry + sortLoiNhuanIndustry + sortVonHoaIndustry + sortTaiSanIndustry, 4) +
            UtilCommonTemplate.checkStarCommon(sortGia1ThangIndustry + sortGia3ThangIndustry + sortGia6ThangIndustry + sortGia1NamIndustry, 4) +
            UtilCommonTemplate.checkStarCommon(sortTyTrongVonHoaIndustry + sortTyTrongTaiSanIndustry, 2), 3
        )
        const totalStarAll = UtilCommonTemplate.checkStarCommon(
            UtilCommonTemplate.checkStarCommon(sortDoanhThuAll + sortLoiNhuanAll + sortVonHoaAll + sortTaiSanAll, 4) +
            UtilCommonTemplate.checkStarCommon(sortGia1ThangAll + sortGia3ThangAll + sortGia6ThangAll + sortGia1NamAll, 4) +
            UtilCommonTemplate.checkStarCommon(sortTyTrongVonHoaAll + sortTyTrongTaiSanAll, 2), 3
        )
        return {
            totalStar: totalStarIndustry,
            totalStarIndustry,
            totalStarAll: 3,
            data
        }
    }
}
import { UtilCommonTemplate } from "../../utils/utils.common";

export class BusinessPositionRatingResponse {
    static mapToList(
        quy_mo_doanh_thu: number,
        quy_mo_von_hoa: number,
        quy_mo_tai_san: number,
        quy_mo_loi_nhuan: number,
        gd_5_phien: number,
        gd_10_phien: number,
        gd_20_phien: number,
        gd_50_phien: number,
        gia_tri_so_huu_khoi_ngoai: number,
        gia_tri_tang_truong_VCSH: number,
        quy_mo_doanh_thu_industry: number,
        quy_mo_von_hoa_industry: number,
        quy_mo_tai_san_industry: number,
        quy_mo_loi_nhuan_industry: number,
        gd_5_phien_industry: number,
        gd_10_phien_industry: number,
        gd_20_phien_industry: number,
        gd_50_phien_industry: number,
        gia_tri_so_huu_khoi_ngoai_industry: number,
        gia_tri_tang_truong_VCSH_industry: number,
        quy_mo_doanh_thu_all: number,
        quy_mo_von_hoa_all: number,
        quy_mo_tai_san_all: number,
        quy_mo_loi_nhuan_all: number,
        gd_5_phien_all: number,
        gd_10_phien_all: number,
        gd_20_phien_all: number,
        gd_50_phien_all: number,
        gia_tri_so_huu_khoi_ngoai_all: number,
        gia_tri_tang_truong_VCSH_all: number
    ) {
        const data = [
            {
                name: 'Quy mô doanh nghiệp',
                value: UtilCommonTemplate.checkStarCommon(quy_mo_doanh_thu + quy_mo_von_hoa + quy_mo_tai_san + quy_mo_loi_nhuan, 4),
                child: [
                    {
                        name: 'Quy mô doanh thu',
                        value: quy_mo_doanh_thu
                    },
                    {
                        name: 'Quy mô vốn hoá',
                        value: quy_mo_von_hoa
                    },
                    {
                        name: 'Quy mô tài sản',
                        value: quy_mo_tai_san
                    },
                    {
                        name: 'Quy mô lợi nhuân',
                        value: quy_mo_loi_nhuan
                    },
                ]
            },
            {
                name: 'Thị trường quan tâm',
                value: UtilCommonTemplate.checkStarCommon(gd_5_phien + gd_10_phien + gd_20_phien + gd_50_phien, 4),
                child: [
                    {
                        name: 'Tỷ lệ GTGD/TT 5 phiên',
                        value: gd_5_phien
                    },
                    {
                        name: 'Tỷ lệ GTGD/TT 10 phiên',
                        value: gd_10_phien
                    },
                    {
                        name: 'Tỷ lệ GTGD/TT 20 phiên',
                        value: gd_20_phien
                    },
                    {
                        name: 'Tỷ lệ GTGD/TT 50 phiên',
                        value: gd_50_phien
                    },
                ]
            },
            {
                name: 'Thu hút đầu tư',
                value: UtilCommonTemplate.checkStarCommon(gia_tri_so_huu_khoi_ngoai + gia_tri_tang_truong_VCSH, 2),
                child: [
                    {
                        name: 'Giá trị sở hữu khối ngoại',
                        value: gia_tri_so_huu_khoi_ngoai
                    },
                    {
                        name: 'Giá trị tăng trưởng VCSH',
                        value: gia_tri_tang_truong_VCSH
                    }
                ]
            }
        ]
        const totalStar = UtilCommonTemplate.checkStarCommon(data.reduce((acc, currentValue) => acc + currentValue.value, 0), 3)
        const totalStarIndustry = UtilCommonTemplate.checkStarCommon(
            UtilCommonTemplate.checkStarCommonV2(
                quy_mo_doanh_thu_industry + quy_mo_tai_san_industry + quy_mo_loi_nhuan_industry + quy_mo_von_hoa_industry, 4
            ) + 
            UtilCommonTemplate.checkStarCommonV2(
                gd_5_phien_industry + gd_10_phien_industry + gd_20_phien_industry + gd_50_phien_industry, 4
            ) +
            UtilCommonTemplate.checkStarCommonV2(
                gia_tri_so_huu_khoi_ngoai_industry + gia_tri_tang_truong_VCSH_industry, 2
            ), 3
        )
        const totalStarAll = UtilCommonTemplate.checkStarCommon(
            UtilCommonTemplate.checkStarCommonV2(
                quy_mo_doanh_thu_all + quy_mo_tai_san_all + quy_mo_loi_nhuan_all + quy_mo_von_hoa_all, 4
            ) + 
            UtilCommonTemplate.checkStarCommonV2(
                gd_5_phien_all + gd_10_phien_all + gd_20_phien_all + gd_50_phien_all, 4
            ) +
            UtilCommonTemplate.checkStarCommonV2(
                gia_tri_so_huu_khoi_ngoai_all + gia_tri_tang_truong_VCSH_all, 2
            ), 3
        )
        return {totalStar, totalStarIndustry, totalStarAll, data}
    }
}
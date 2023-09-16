import { ApiProperty } from "@nestjs/swagger"

class InvestmentFilterBodyDto {
    @ApiProperty({
        type: String
    })
    key: string

    @ApiProperty({
        type: Number
    })
    from: number

    @ApiProperty({
        type: Number
    })
    to: number
}

export class InvestmentFilterDto {
    @ApiProperty({
        type: InvestmentFilterBodyDto,
        isArray: true
    })
    filter: InvestmentFilterBodyDto[]

    @ApiProperty({
        type: Number
    })
    limit: number

    @ApiProperty({
        type: Number
    })
    page: number

    @ApiProperty({
        type: String,
        description: `Nếu lấy tất cả truyền lên 'ALL'`,
        example: 'HNX, UPCOM, HOSE'
    })
    exchange: string

    @ApiProperty({
        type: String,
        example: 'banLe,baoHiem,batDongSan,nganHang, ...',
        description: `
        baoHiem: 'Bảo hiểm',
        batDongSan: 'Bất động sản',
        congNghe: 'Công nghệ',
        dauKhi: 'Dầu khí',
        banLe: 'Dịch vụ bán lẻ',
        taiChinh: 'Dịch vụ tài chính',
        tienIch: 'Dịch vụ tiện ích',
        doGiaDung: 'Đồ dùng cá nhân và đồ gia dụng',
        duLich: 'Du lịch & Giải trí',
        hangHoa: 'Hàng hóa và dịch vụ công nghiệp',
        hoaChat: 'Hóa chất',
        nganHang: 'Ngân hàng',
        oto: 'Ôtô & linh kiện phụ tùng',
        truyenThong: 'Phương tiện truyền thông',
        thucPham: 'Thực phẩm & Đồ uống',
        vienThong: 'Viễn thông',
        xayDung: 'Xây dựng & Vật liệu',
        taiNguyen: 'Tài nguyên',
        yTe: 'Y tế',`,
      })
      industry: string;
}

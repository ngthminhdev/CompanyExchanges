import { ApiProperty } from "@nestjs/swagger";


export class IPPIndustryDto {
    @ApiProperty({
        type: String,
        description: `
        cheBienGo : 'Chế biến gỗ và sản xuất sản phẩm từ gỗ, tre, nứa (trừ giường, tủ, bàn ghế); sản xuất sản phẩm từ rơm, rạ và vật liệu tết bện',
        cheBienKhac : 'Công nghiệp chế biến, chế tạo khác',
        det : 'Dệt',
        inSaoChep : 'In, sao chép bản ghi các loại',
        Da : 'Sản xuất da và các sản phẩm có liên quan',
        doUong : 'Sản xuất đồ uống',
        giay : 'Sản xuất giấy và sản phẩm từ giấy',
        giuongTu : 'Sản xuất giường, tủ, bàn, ghế',
        hoaChat : 'Sản xuất hoá chất và sản phẩm hoá chất',
        kimLoai : 'Sản xuất kim loại',
        mayMoc : 'Sản xuất máy móc, thiết bị chưa được phân vào đâu',
        vanTai : 'Sản xuất phương tiện vận tải khác',
        dienTu : 'Sản xuất sản phẩm điện tử, máy vi tính và sản phẩm quang học',
        thuocLa : 'Sản xuất sản phẩm thuốc lá',
        caoSu : 'Sản xuất sản phẩm từ cao su và plastic',
        phiKimLoai : 'Sản xuất sản phẩm từ khoáng phi kim loại khác',
        kimLoaiDucSan : 'Sản xuất sản phẩm từ kim loại đúc sẵn (trừ máy móc, thiết bị)',
        than : 'Sản xuất than cốc, sản phẩm dầu mỏ tinh chế',
        dien : 'Sản xuất thiết bị điện',
        duocLieu : 'Sản xuất thuốc, hoá dược và dược liệu',
        trangPhuc : 'Sản xuất trang phục',
        dongCo : 'Sản xuất xe có động cơ, rơ moóc',
        thucPham : 'Sản xuất, chế biến thực phẩm',
        all : 'TOÀN NGÀNH CHẾ BIẾN, CHẾ TẠO',
    `
    })
    industry: string;
}
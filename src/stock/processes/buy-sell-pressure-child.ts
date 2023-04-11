// child-process.ts
import connectDB from "../../utils/utils.connect-database";
import {ExceptionResponse} from "../../exceptions/common.exception";
import {HttpStatus} from "@nestjs/common";

process.on('message', async (data: any) => {
    try {
        // HSX, HNX, UPCOM, ALL
        const { exchange } = data;
        let ex = "";
        switch (exchange) {
            case 'HSX':
                ex = 'VNINDEX'
            break;
            case 'HNX':
                ex = 'HNXINDEX'
                break;
            default:
                ex = 'UPINDEX'
        }
        let query: string = `
            select top 1 Khoi_luong_cung as sellPressure, Khoi_luong_cau as buyPressure
            from [PHANTICH].[dbo].[INDEX_AC_CC]
            where Ticker = '${ex}' order by
            [Date Time] desc
        `;

        if (exchange == 'ALL') {
            query = `
                select sum(CAST(Khoi_luong_cung AS int)) as sellPressure, sum(CAST(Khoi_luong_cau AS int)) as buyPressure
                from [PHANTICH].[dbo].[INDEX_AC_CC]
                where Ticker in ('VNINDEX', 'HNXINDEX', 'UPINDEX')
            `;
        }

        // tạo database connection mới và thực hiện truy vấn
        const sql = await connectDB();
        const buySellData = (await sql.query(query)).recordset;

        // gửi kết quả truy vấn về cho process cha
        process.send(buySellData);
        await sql.close();
    } catch (e) {
        console.log(e)
        throw new ExceptionResponse(HttpStatus.BAD_REQUEST, 'Error')
    }
});
// child-process.ts
import connectDB from "../../utils/utils.connect-database";
import {IndustryRawInterface} from "../interfaces/industry.interface";
import {BooleanEnum} from "../../enums/common.enum";
import {ExceptionResponse} from "../../exceptions/common.exception";
import {HttpStatus} from "@nestjs/common";

export const isEqual = (yesterdayItem: IndustryRawInterface, item: IndustryRawInterface): BooleanEnum => {
    const change = item.close_price - yesterdayItem.close_price;
    return change === 0 ? BooleanEnum.True : BooleanEnum.False
};

export const isIncrease = (yesterdayItem: IndustryRawInterface, item: IndustryRawInterface): BooleanEnum => {
    return item.close_price > yesterdayItem.close_price && item.close_price < yesterdayItem.close_price * 1.07
        ? BooleanEnum.True : BooleanEnum.False;
};

export const isDecrease = (yesterdayItem: IndustryRawInterface, item: IndustryRawInterface): BooleanEnum => {
    return item.close_price < yesterdayItem.close_price && item.close_price > yesterdayItem.close_price * 0.93
        ? BooleanEnum.True : BooleanEnum.False;
};

export const isHigh = (yesterdayItem: IndustryRawInterface, item: IndustryRawInterface): BooleanEnum => {
    return item.close_price = item.ceilingPrice
        ? BooleanEnum.True : BooleanEnum.False;
};

export const isLow = (yesterdayItem: IndustryRawInterface, item: IndustryRawInterface): BooleanEnum => {
    return item.close_price =  item.floorPrice
        ? BooleanEnum.True : BooleanEnum.False;
};
process.on('message', async (data: any) => {
    try {

        const { query1, query2 } = data;
        
        // tạo database connection mới và thực hiện truy vấn
        const sql = await connectDB();

        const [dataToday, dataYesterday]: [IndustryRawInterface[], IndustryRawInterface[]] =
            await Promise.all([(await sql.query(query1)).recordset, (await sql.query(query2)).recordset])

        const result = dataToday.map((item) => {
            const yesterdayItem = dataYesterday.find(i => i.ticker === item.ticker);
            if (!yesterdayItem) return;
            return {
                industry: item.industry,
                equal: isEqual(yesterdayItem, item),
                increase: isIncrease(yesterdayItem, item),
                decrease: isDecrease(yesterdayItem, item),
                high: isHigh(yesterdayItem, item),
                low: isLow(yesterdayItem, item),
            };
        });


        process.send(result);
        await sql.close();
    } catch (e) {
        console.log(e)
        throw new ExceptionResponse(HttpStatus.BAD_REQUEST, 'Error')
    }
});
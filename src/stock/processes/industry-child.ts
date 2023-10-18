import connectDB from '../../utils/utils.connect-database';
import { ExceptionResponse } from '../../exceptions/common.exception';
import { HttpStatus } from '@nestjs/common';

process.on('message', async (data: any) => {
  try {
    const { marketCapQuery } = data;
    
    // tạo database connection mới và thực hiện truy vấn
    const sql = await connectDB();
    
    const marketCap = (await sql.query(marketCapQuery)).recordset;

    const groupByIndustry = marketCap.reduce((result, item) => {
      (result[item.industry] || (result[item.industry] = [])).push(item);
      return result;
    }, {});

    //Calculate change percent per day, week, month
    const industryChanges = Object.entries(groupByIndustry).map(
      ([industry, values]: any) => {
        return {
          industry,
          day_change_percent:
            ((values[0].total_market_cap - values[1].total_market_cap) /
              values[1].total_market_cap) *
            100,
          week_change_percent: !values[2]?.total_market_cap ? 0 :
            ((values[0].total_market_cap - values[2].total_market_cap) /
              values[2].total_market_cap) *
            100,
          month_change_percent: !values[3]?.total_market_cap ? 0 :
            ((values[0].total_market_cap - values[3].total_market_cap) /
              values[3].total_market_cap) *
            100,
          ytd: !values[4]?.total_market_cap ? 0 :
            ((values[0].total_market_cap - values[4].total_market_cap) /
              values[4].total_market_cap) *
            100,
        };
      },
    );

    // gửi kết quả truy vấn về cho process cha
    process.send(industryChanges);
    await sql.close();
  } catch (e) {
    console.log(e);
    throw new ExceptionResponse(HttpStatus.BAD_REQUEST, 'Error');
  }
});

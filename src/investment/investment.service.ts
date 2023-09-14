import { Injectable } from '@nestjs/common';
import { MssqlService } from '../mssql/mssql.service';
import { InvestmentFilterDto } from './dto/investment-filter.dto';

@Injectable()
export class InvestmentService {
  constructor(
    private readonly mssqlService: MssqlService
  ){}


  async filter(b: InvestmentFilterDto) {
    const result = b.filter.map(item => `${item.key} >= ${item.from} and ${item.key} <= ${item.to}`).join(` and `)
    
    const query = `
    SELECT
      code,
      closePrice,
      ${b.filter.map(item => item.key).join(',')}
    FROM RATIO.dbo.ratioInday
    WHERE ${result}
    AND date = (SELECT TOP 1
      date
    FROM RATIO.dbo.ratioInday
    ORDER BY date DESC)
    AND type = 'STOCK'
    ORDER BY code asc
    OFFSET ${(b.page - 1) * b.limit} ROWS
    FETCH NEXT ${b.limit} ROWS ONLY;
    `
    console.log(query);
    
    const data = await this.mssqlService.query(query)
    return data
    
  }
}

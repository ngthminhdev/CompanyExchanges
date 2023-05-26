import { Injectable } from '@nestjs/common';
import { CatchException } from '../exceptions/common.exception';
import { UtilCommonTemplate } from '../utils/utils.common';
const sql = require('mssql');

@Injectable()
export class MssqlService {
  private database: any;
  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      this.database = await sql.connect(
        'Server=192.168.13.22,1433;Database=marketTrade;User Id=THANHMINH;Password=123beta456;Encrypt=false',
      );
    } catch (e) {
      throw new CatchException(e);
    }
  }

  async query<T>(query: string): Promise<T> {
    return (await this.database.query(query)).recordset;
  }

  async getDate<T>(query: string): Promise<T> {
    return UtilCommonTemplate.toDate(
      (await this.database.query(query))?.recordset[0]?.date,
    );
  }
}

import {CACHE_MANAGER, Inject, Injectable} from "@nestjs/common";
import {Cache} from "cache-manager";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import { InvestorTypeEnum } from "../enums/common.enum";


@Injectable()
export class CashFlowService {
    constructor(
        @Inject(CACHE_MANAGER)
        private readonly redis: Cache,
        @InjectDataSource() private readonly db: DataSource,
    ) {
    }

    //Diễn biến giao dịch đầu tư
    async getInvestorTransactions(investorType: number, type: number) {
        let query!: string;
        switch (investorType) {
            case InvestorTypeEnum.Foreign:
                query = `
                    select ticker, t.price foreign_total_buy as buyVolume,
                    foreign_total_sell as sellVolume,
                    total_value_buy as buyValue,
                    total_value_sell as sellValue
                    from [PHANTICH].[dbo].[]
                `
                break;
            case InvestorTypeEnum.Retail:
                query = `
                    select 
                `
                break;
            default:
                break;
        }
    }
}
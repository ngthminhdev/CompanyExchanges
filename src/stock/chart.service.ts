import {CACHE_MANAGER, Inject, Injectable} from "@nestjs/common";
import {MarketLiquidityChartResponse} from "./responses/MarketLiquidityChart.response";
import {CatchException} from "../exceptions/common.exception";
import {Cache} from "cache-manager";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {MarketBreadthResponse} from "./responses/MarketBreadth.response";
import {VnIndexResponse} from "./responses/Vnindex.response";
import {TransactionTimeTypeEnum} from "../enums/common.enum";
import {StockService} from "./stock.service";
import {SessionDatesInterface} from "./interfaces/session-dates.interface";
import * as moment from "moment";
import {RedisKeys} from "../enums/redis-keys.enum";
import {UtilCommonTemplate} from "../utils/utils.common";


@Injectable()
export class ChartService {
    constructor(
        @Inject(CACHE_MANAGER)
        private readonly redis: Cache,
        @InjectDataSource() private readonly db: DataSource,
        private readonly stockService: StockService,
    ) {
    }

    // Thanh khoản phiên trước
    async getMarketLiquidityYesterday() {
        try {
            return new MarketLiquidityChartResponse().mapToList(await this.db.query(`
                SELECT * FROM [WEBSITE_SERVER].[dbo].[Liquidity_yesterday]
                ORDER BY time ASC
            `));
        } catch (e) {
            throw new CatchException(e)
        }
    }

    //Thanh khoản phiên hiện tại
    async getMarketLiquidityToday() {
        try {
            return new MarketLiquidityChartResponse().mapToList(await this.db.query(`
                SELECT * FROM [WEBSITE_SERVER].[dbo].[Liquidity_today]
                ORDER BY time ASC
            `));
        } catch (e) {
            throw new CatchException(e)
        }
    }

    // Độ rộng ngành
    async getMarketBreadth() {
        try {
            return new MarketBreadthResponse().mapToList(await this.db.query(`
                SELECT * FROM [WEBSITE_SERVER].[dbo].[MarketBreadth]
                ORDER BY time ASC
            `));
        } catch (e) {
            throw new CatchException(e)
        }
    }

    // Chỉ số Vn index
    async getVnIndex(type: number): Promise<VnIndexResponse[]> {
        try {
            if (type === TransactionTimeTypeEnum.Latest) {
                const data = await this.db.query(`
                    SELECT * FROM [WEBSITE_SERVER].[dbo].[VNI_realtime]
                    ORDER BY tradingDate ASC
                `)
                return new VnIndexResponse().mapToList(data, type);
            }
            const redisData: VnIndexResponse[] = await this.redis.get(`${RedisKeys.VnIndex}:${type}`);
            if (redisData) return redisData;

            const {latestDate, weekDate}: SessionDatesInterface = await this.stockService.getSessionDate('[PHANTICH].[dbo].[database_chisotoday]')
            let startDate: Date | string;
            switch (type) {
                case TransactionTimeTypeEnum.OneWeek:
                    startDate = weekDate;
                    break;
                case TransactionTimeTypeEnum.OneMonth:
                    startDate = UtilCommonTemplate.toDateTime(moment().startOf('month'));
                    break;
                case TransactionTimeTypeEnum.YearToDate:
                    startDate = UtilCommonTemplate.toDateTime(moment().startOf('year'));
                    break;
                default:
                    startDate = latestDate;
            }

            const query: string = `
                select ticker as comGroupCode, close_price as indexValue, date_time as tradingDate
                from [PHANTICH].[dbo].[database_chisotoday]
                where ticker = 'VNINDEX' and date_time >= @0 and date_time <= @1
                ORDER BY date_time desc
            `;

            const mappedData = new VnIndexResponse().mapToList(await this.db.query(query, [startDate, latestDate]), type);
            await this.redis.set(`${RedisKeys.VnIndex}:${type}`, mappedData);
            return mappedData;
        } catch (e) {
            throw new CatchException(e)
        }
    }
}
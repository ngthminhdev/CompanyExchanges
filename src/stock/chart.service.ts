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
import {LineChartResponse} from "../kafka/responses/LineChart.response";
import {GetLiquidityQueryDto} from "./dto/getLiquidityQuery.dto";
import {TickerContributeResponse} from "./responses/TickerContribute.response";


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
    async getVnIndex(type: number): Promise<any> {
        try {
            const industryFull = await this.redis.get(RedisKeys.IndustryFull)
            if (type === TransactionTimeTypeEnum.Latest) {
                const data = await this.db.query(`
                    SELECT * FROM [WEBSITE_SERVER].[dbo].[VNI_realtime]
                    ORDER BY tradingDate ASC
                `);

                return {vnindexData: new VnIndexResponse().mapToList(data, type), industryFull};
            }
            const redisData: VnIndexResponse[] = await this.redis.get(`${RedisKeys.VnIndex}:${type}`);
            if (redisData) return {vnindexData: redisData, industryFull};

            const {
                latestDate,
                weekDate,
                monthDate
            }: SessionDatesInterface = await this.stockService.getSessionDate('[PHANTICH].[dbo].[database_chisotoday]')
            let startDate: Date | string;
            switch (type) {
                case TransactionTimeTypeEnum.OneWeek:
                    startDate = weekDate;
                    break;
                case TransactionTimeTypeEnum.OneMonth:
                    startDate = monthDate;
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
                ORDER BY date_time
            `;

            const mappedData = new VnIndexResponse().mapToList(await this.db.query(query, [startDate, latestDate]), type);
            await this.redis.set(`${RedisKeys.VnIndex}:${type}`, mappedData);
            return {vnidexData: mappedData, industryFull};
        } catch (e) {
            throw new CatchException(e)
        }
    }

    async getVnIndexNow(): Promise<any> {
        try {
            const data = await this.db.query(`
                    SELECT * FROM [WEBSITE_SERVER].[dbo].[VNI_realtime]
                    ORDER BY tradingDate ASC
                `);
            return new LineChartResponse().mapToList(data)
                .sort((a, b) => a.tradingDate - b.tradingDate > 0 ? 1: -1);
        } catch (e) {
            throw new CatchException(e)
        }
    }

    async getTickerContribute(q: GetLiquidityQueryDto): Promise<any> {
        try {
            const {exchange, order, type} = q;
            const redisData = await this.redis.get(`${RedisKeys.TickerContribute}:${type}:${order}:${exchange}`);
            if (redisData) return redisData;

            const {latestDate, weekDate, monthDate, firstDateYear} = await this.stockService.getSessionDate('[PHANTICH].[dbo].[database_mkt]')
            const ex:string = exchange.toUpperCase() === 'UPCOM' ? 'UPCoM' : exchange.toUpperCase();
            let endDate: Date | string;

            switch (+order) {
                case TransactionTimeTypeEnum.Latest:
                    endDate = UtilCommonTemplate.toDate(latestDate);
                break;
                case TransactionTimeTypeEnum.OneWeek:
                    endDate = UtilCommonTemplate.toDate(weekDate);
                break;
                case TransactionTimeTypeEnum.OneMonth:
                    endDate = UtilCommonTemplate.toDate(monthDate);
                break;
                default:
                    endDate = UtilCommonTemplate.toDate(firstDateYear);
                break;
            }

            const query = (startDate, endDate): string => `
                WITH temp AS (
                  SELECT TOP 10 ticker, sum(diemanhhuong) as contribute_price
                  FROM [COPHIEUANHHUONG].[dbo].[${ex}] 
                  WHERE date >= '${startDate}' and date <= '${endDate}'
                  GROUP BY ticker
                  ORDER BY contribute_price DESC
                  UNION ALL
                  SELECT TOP 10 ticker, sum(diemanhhuong) as contribute_price
                  FROM [COPHIEUANHHUONG].[dbo].[${ex}] 
                  WHERE date >= '${startDate}' and date <= '${endDate}'
                  GROUP BY ticker
                  ORDER BY contribute_price ASC
                )
                SELECT *
                FROM temp;
            `;

            const data = await this.db.query(query(endDate, UtilCommonTemplate.toDate(latestDate)));
            const mappedData = new TickerContributeResponse().mapToList(data);
            await this.redis.set(`${RedisKeys.TickerContribute}:${type}:${order}:${exchange}`, mappedData)
            return mappedData;


        } catch (e) {
            throw new CatchException(e)
        }
    }
}
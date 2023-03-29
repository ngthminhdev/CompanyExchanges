import {CACHE_MANAGER, Inject, Injectable} from "@nestjs/common";
import {MarketLiquidityChartResponse} from "./responses/MarketLiquidityChart.response";
import {CatchException} from "../exceptions/common.exception";
import {Cache} from "cache-manager";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {MarketBreadthResponse} from "./responses/MarketBreadth.response";
import {VnIndexResponse} from "./responses/Vnindex.response";


@Injectable()
export class ChartService {
    constructor(
        @Inject(CACHE_MANAGER)
        private readonly redis: Cache,
        @InjectDataSource() private readonly db: DataSource,
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
    async getVnIndex() {
        try {
            return new VnIndexResponse().mapToList(await this.db.query(`
                SELECT * FROM [WEBSITE_SERVER].[dbo].[VNI_realtime]
                ORDER BY tradingDate ASC
            `));
        } catch (e) {
            throw new CatchException(e)
        }
    }
}
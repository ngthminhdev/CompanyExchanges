import {Controller, Get, HttpStatus, Query, Res} from "@nestjs/common";
import {ApiOkResponse, ApiOperation, ApiTags} from "@nestjs/swagger";
import {MarketLiquidityChartSwagger} from "./responses/MarketLiquidityChart.response";
import {Response} from "express";
import {BaseResponse} from "../utils/utils.response";
import {MarketBreadthSwagger} from "./responses/MarketBreadth.response";
import {ChartService} from "./chart.service";
import {VnIndexSwagger} from "./responses/Vnindex.response";
import {TimestampQueryDto} from "./dto/timestampQuery.dto";
import {LineChartSwagger} from "../kafka/responses/LineChart.response";
import {LiquidContributeQueryDto} from "./dto/liquidContributeQuery.dto";
import {GetLiquidityQueryDto} from "./dto/getLiquidityQuery.dto";
import {TickerContributeSwagger} from "./responses/TickerContribute.response";


@Controller('chart')
@ApiTags('Chart - Api')
export class ChartController {
    constructor(
        private readonly chartService: ChartService
    ) {
    }

    @Get('liquidity-today')
    @ApiOperation({
        summary: 'chart thanh khoản hôm nay',
    })
    @ApiOkResponse({type: MarketLiquidityChartSwagger})
    async getMarketLiquidityToday(@Res() res: Response) {
        const data = await this.chartService.getMarketLiquidityToday();
        return res.status(HttpStatus.OK).send(new BaseResponse({data}));
    }

    @Get('liquidity-yesterday')
    @ApiOperation({
        summary: 'chart thanh khoản phiên trước',
    })
    @ApiOkResponse({type: MarketLiquidityChartSwagger})
    async getMarketLiquidityYesterday(@Res() res: Response) {
        const data = await this.chartService.getMarketLiquidityYesterday();
        return res.status(HttpStatus.OK).send(new BaseResponse({data}));
    }

    @Get('market-breadth')
    @ApiOperation({summary: 'chart độ rộng ngành'})
    @ApiOkResponse({type: MarketBreadthSwagger})
    async getMarketBreadth(@Res() res: Response) {
        const data = await this.chartService.getMarketBreadth();
        return res.status(HttpStatus.OK).send(new BaseResponse({data}));
    }

    @Get('vnindex')
    @ApiOperation({summary: 'chart line chỉ số vnindex'})
    @ApiOkResponse({type: VnIndexSwagger})
    async getVnIndex(@Query() q: TimestampQueryDto,@Res() res: Response) {
        const data = await this.chartService.getVnIndex(parseInt(q.type));
        return res.status(HttpStatus.OK).send(new BaseResponse({data}));
    }

    @Get('vnindex-now')
    @ApiOperation({summary: 'chart line chỉ số vnindex realtime'})
    @ApiOkResponse({type: LineChartSwagger})
    async getVnIndexNow(@Res() res: Response) {
        const data = await this.chartService.getVnIndexNow();
        return res.status(HttpStatus.OK).send(new BaseResponse({data}));
    }

    @Get('ticker-contribute')
    @ApiOperation({
        summary: 'Top cổ phiếu đóng góp',
        description:
            `<h3>
            <font color="#228b22">Các sàn có dữ liệu: </font>
            <font color="#ff4500">HNX, HNX30, HOSE, VN30, UPCOM</font>
            </h3>`
    })
    @ApiOkResponse({type: TickerContributeSwagger})
    async getTickerContribute(@Query() q: GetLiquidityQueryDto, @Res() res: Response) {
        const data = await this.chartService.getTickerContribute(q);
        return res.status(HttpStatus.OK).send(new BaseResponse({data}));
    }
}

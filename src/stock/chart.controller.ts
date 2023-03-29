import {Controller, Get, HttpStatus, Res} from "@nestjs/common";
import {ApiOkResponse, ApiOperation, ApiTags} from "@nestjs/swagger";
import {MarketLiquidityChartSwagger} from "./responses/MarketLiquidityChart.response";
import {Response} from "express";
import {BaseResponse} from "../utils/utils.response";
import {MarketBreadthSwagger} from "./responses/MarketBreadth.response";
import {ChartService} from "./chart.service";
import {VnIndexSwagger} from "./responses/Vnindex.response";


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
    async getVnIndex(@Res() res: Response) {
        const data = await this.chartService.getVnIndex();
        return res.status(HttpStatus.OK).send(new BaseResponse({data}));
    }
}

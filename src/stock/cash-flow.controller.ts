import { Controller, Get, HttpStatus, Query, Res } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { BaseResponse } from "../utils/utils.response";
import { CashFlowService } from "./cash-flow.service";
import { CashTypeQueryDto } from "./dto/cashTypeQuery.dto";
import { TickerContributeSwagger } from "./responses/TickerContribute.response";


@Controller('cash-flow')
@ApiTags('Cash Flow - API')
export class CashFlowController {
    constructor(
        private readonly cashFlowService: CashFlowService
    ) {
    }

    @Get('investor-transaction')
    @ApiOperation({
        summary: 'Top cổ phiếu đóng góp',
        description:
            `<h3>
            <font color="#228b22">Các sàn có dữ liệu: </font>
            <font color="#ff4500">HNX, HNX30, HOSE, VN30, UPCOM</font>
            </h3>`
    })
    @ApiOkResponse({type: TickerContributeSwagger})
    async getTickerContribute(@Query() q: CashTypeQueryDto, @Res() res: Response) {
        const data = await this.cashFlowService.getInvestorTransactions(parseInt(q.investorType), parseInt(q.type));
        return res.status(HttpStatus.OK).send(new BaseResponse({data}));
    }

}
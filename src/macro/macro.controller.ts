import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { OrderDto } from '../market/dto/order.dto';
import { BaseResponse } from '../utils/utils.response';
import { MacroService } from './macro.service';
import { GDPSwagger } from './responses/gdp.response';

@ApiTags('API - macro')
@Controller('macro')
export class MacroController {
  constructor(private readonly macrosService: MacroService) {}

  @Get('gdp-theo-nganh')
  @ApiOperation({
    summary: 'Giá trị GDP theo các nhóm ngành chính (Tỷ đồng)',
  })
  @ApiOkResponse({ type: GDPSwagger })
  async industryGDPValue(@Res() res: Response) {
    const data = await this.macrosService.industryGDPValue();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('gdp-theo-gia')
  @ApiOperation({
    summary: 'GDP theo giá cố định và giá hiện hành (Tỷ đồng)',
  })
  @ApiOkResponse({ type: GDPSwagger })
  async gdpPrice(@Res() res: Response) {
    const data = await this.macrosService.gdpPrice();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('gdp-dong-gop')
  @ApiOperation({
    summary: 'Tỷ trọng đóng góp GDP theo các nhóm ngành chính (%)',
  })
  @ApiOkResponse({ type: GDPSwagger })
  async idustryGDPContibute(@Res() res: Response) {
    const data = await this.macrosService.idustryGDPContibute();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('gdp-tang-truong')
  @ApiOperation({
    summary: 'Tăng trưởng GDP theo từng ngành nghề (Tỷ đồng)',
  })
  @ApiOkResponse({ type: GDPSwagger })
  async idustryGDPGrowth(@Query() q: OrderDto, @Res() res: Response) {
    const data = await this.macrosService.idustryGDPGrowth(parseInt(q.order));
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('per-gdp-tang-truong')
  @ApiOperation({
    summary: 'Tăng trưởng GDP theo từng ngành nghề (Tỷ đồng)',
  })
  @ApiOkResponse({ type: GDPSwagger })
  async idustryGDPGrowthPercent(@Res() res: Response) {
    const data = await this.macrosService.idustryGDPGrowthPercent();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }
}

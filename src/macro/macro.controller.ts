import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { BaseResponse } from '../utils/utils.response';
import { MacroService } from './macro.service';
import { GDPSwagger } from './responses/gdp.response';

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
}

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

  /**
   * API site GDP
   */

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
    summary: 'Tăng trưởng GDP theo từng ngành nghề (%)',
  })
  @ApiOkResponse({ type: GDPSwagger })
  async idustryGDPGrowthPercent(@Res() res: Response) {
    const data = await this.macrosService.idustryGDPGrowthPercent();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  /**
   * API site CPI
   */

  @Get('per-cpi-theo-linh-vuc')
  @ApiOperation({
    summary: 'CPI theo các lĩnh vực của nền kinh tế (%)',
  })
  @ApiOkResponse({ type: GDPSwagger })
  async idustryCPIPercent(@Res() res: Response) {
    const data = await this.macrosService.idustryCPIPercent();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('table-cpi-theo-linh-vuc')
  @ApiOperation({
    summary: 'Bảng CPI theo các lĩnh vực của nền kinh tế',
  })
  @ApiOkResponse({ type: GDPSwagger })
  async idustryCPITable(@Res() res: Response) {
    const data = await this.macrosService.idustryCPITable();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('per-cpi-cung-ky')
  @ApiOperation({
    summary: 'CPI các tháng so với cùng kỳ năm trước (%)',
  })
  @ApiOkResponse({ type: GDPSwagger })
  async idustryCPISameQuater(@Res() res: Response) {
    const data = await this.macrosService.idustryCPISameQuater();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('cpi-thay-doi')
  @ApiOperation({
    summary: 'Thay đổi CPI các lĩnh vực của nền kinh tế ',
  })
  @ApiOkResponse({ type: GDPSwagger })
  async idustryCPIChange(@Query() q: OrderDto, @Res() res: Response) {
    const data = await this.macrosService.idustryCPIChange(parseInt(q.order));
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('cpi-quyen-so')
  @ApiOperation({
    summary: 'Quyền số CPI theo rổ hàng hóa (%)',
  })
  @ApiOkResponse({ type: GDPSwagger })
  async cpiQuyenSo(@Res() res: Response) {
    const data = await this.macrosService.cpiQuyenSo();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  /**
   * IPP
   */

  @Get('ipp-chi-so-cong-nghiep')
  @ApiOperation({
    summary: 'Chỉ số sản xuất công nghiệp (%)',
  })
  @ApiOkResponse({ type: GDPSwagger })
  async industrialIndex(@Res() res: Response) {
    const data = await this.macrosService.industrialIndex();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('ipp-chi-so-cong-nghiep-table')
  @ApiOperation({
    summary: 'Bảng chỉ số sản xuất công nghiệp',
  })
  @ApiOkResponse({ type: GDPSwagger })
  async industrialIndexTable(@Res() res: Response) {
    const data = await this.macrosService.industrialIndexTable();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('ipp-tieu-thu-va-ton-kho')
  @ApiOperation({
    summary: 'Chỉ số sản xuất công nghiệp (%)',
  })
  @ApiOkResponse({ type: GDPSwagger })
  async ippConsumAndInventory(@Res() res: Response) {
    const data = await this.macrosService.ippConsumAndInventory();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }
}

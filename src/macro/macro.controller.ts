import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { OrderDto } from '../market/dto/order.dto';
import { BaseResponse } from '../utils/utils.response';
import { MacroService } from './macro.service';
import { GDPSwagger } from './responses/gdp.response';
import { IPPIndustryDto, IPPMostIndusProductionDto, IPPProductionIndexDto } from './dto/ipp-industry.dto';
import { LaborForceResponse } from './responses/labor-force.response';
import { CatchException } from '../exceptions/common.exception';
import { IndustrialIndexDto } from './dto/ipp-industry-index.dto';
import { FDIOrderDto } from './dto/fdi-order.dto';
import { TotalInvestmentProjectsResponse } from './responses/total-invesment-project.response';
import { ForeignInvestmentIndexDto } from './dto/foreign-investment-index.dto';
import { ForeignInvestmentIndexResponse } from './responses/foreign-investment.response';
import { AccumulatedResponse } from './responses/accumulated.response';
import { TotalOutstandingBalanceResponse } from './responses/total-outstanding-balance.response';
import { CorporateBondsIssuedSuccessfullyResponse } from './responses/corporate-bonds-issued-successfully.response';

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
  async industrialIndex(@Res() res: Response, @Query() q: IndustrialIndexDto) {
    const data = await this.macrosService.industrialIndex(+q.industry);
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
    summary: 'Chỉ số tiêu thụ & tồn kho SP công nghiệp (%))',
  })
  @ApiOkResponse({ type: GDPSwagger })
  async ippConsumAndInventory(
    @Query() q: IPPIndustryDto,
    @Res() res: Response,
  ) {
    const data = await this.macrosService.ippConsumAndInventory(q.industry);
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('ipp-san-xuat-cong-nghiep')
  @ApiOperation({
    summary: 'Chỉ số sản xuất công nghiệp theo ngành công nghiệp (%)',
  })
  @ApiOkResponse({ type: GDPSwagger })
  async ippIndusProductionIndex(
    @Query() q: IPPProductionIndexDto,
    @Res() res: Response,
  ) {
    const data = await this.macrosService.ippIndusProductionIndex(q.industry);
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('ipp-san-luong-cong-nghiep')
  @ApiOperation({
    summary: 'Sản lượng công nghiệp các sản phẩm chủ yếu',
  })
  @ApiOkResponse({ type: GDPSwagger })
  async ippMostIndusProduction(
    @Query() q: IPPMostIndusProductionDto,
    @Res() res: Response,
  ) {
    const data = await this.macrosService.ippMostIndusProduction(q.industry);
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  /**
   * Lao động
   */

  @Get('luc-luong-lao-dong')
  @ApiOperation({
    summary: 'Lực lượng lao động',
  })
  @ApiOkResponse({type: LaborForceResponse})
  async laborForce(
    @Res() res: Response,
  ) {
    const data = await this.macrosService.laborForce();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('ti-le-that-nghiep-cac-nhom-lao-dong')
  @ApiOperation({
    summary: 'Tỷ lệ thất nghiệp các nhóm lao động',
  })
  @ApiOkResponse({type: LaborForceResponse})
  async unemployedRate(
    @Res() res: Response,
  ) {
    const data = await this.macrosService.unemployedRate();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('ti-le-lao-dong-theo-linh-vuc')
  @ApiOperation({
    summary: 'Tỷ lệ lao động theo lĩnh vực (%)',
  })
  @ApiOkResponse({type: LaborForceResponse})
  async laborRate(
    @Res() res: Response,
  ) {
    const data = await this.macrosService.laborRate();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('ti-le-lao-dong-phi-chinh-thuc')
  @ApiOperation({
    summary: 'Tỷ lệ lao động phi chính thức (%)',
  })
  @ApiOkResponse({type: LaborForceResponse})
  async informalLaborRate(
    @Res() res: Response,
  ) {
    const data = await this.macrosService.informalLaborRate();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('muc-luong-binh-quan-thi-truong-lao-dong')
  @ApiOperation({
    summary: 'Mức lương bình quân trên thị trường lao động ',
  })
  @ApiOkResponse({type: LaborForceResponse})
  async averageSalary(
    @Res() res: Response,
  ) {
    const data = await this.macrosService.averageSalary();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('bien-dong-viec-lam-so-voi-cung-ky')
  @ApiOperation({
    summary: 'Biến động việc làm so với cùng kỳ',
  })
  @ApiOkResponse({type: LaborForceResponse})
  async employmentFluctuations(
    @Res() res: Response,
  ) {
    const data = await this.macrosService.employmentFluctuations();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  //Tín dụng

  @Get('tong-phuong-tien-thanh-toan')
  @ApiOperation({summary: 'Tổng phương tiện thanh toán'})
  async totalPayment(@Res() res: Response){
    try {
      const data = await this.macrosService.totalPayment()
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e)
    }
  }

  @Get('tang-truong-tong-phuong-tien-thanh-toan')
  @ApiOperation({summary: 'Tổng phương tiện thanh toán tăng trưởng'})
  async totalPaymentPercent(@Res() res: Response){
    try {
      const data = await this.macrosService.totalPaymentPercent()
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e)
    }
  }

  @Get('can-can-thanh-toan-quoc-te')
  @ApiOperation({summary: 'Cán cân thanh toán quốc tế'})
  async balancePaymentInternational(@Res() res: Response){
    try {
      const data = await this.macrosService.balancePaymentInternational()
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e)
    }
  }

  @Get('du-no-tin-dung')
  @ApiOperation({summary: 'Dư nợ tín dụng đối với nền kinh tế (tỷ VNĐ)'})
  async creditDebt(@Res() res: Response){
    try {
      const data = await this.macrosService.creditDebt()
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e)
    }
  }

  @Get('tang-truong-du-no-tin-dung')
  @ApiOperation({summary: 'Tăng trưởng dư nợ tín dụng đối với nền kinh tế (%)'})
  async creditDebtPercent(@Res() res: Response){
    try {
      const data = await this.macrosService.creditDebtPercent()
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e)
    }
  }

  @Get('thong-ke-theo-loai-hinh-to-chuc-tin-dung')
  @ApiOperation({summary: 'Thống kê theo loại hình tổ chức tín dụng'})
  async creditInstitution(@Res() res: Response){
    try {
      const data = await this.macrosService.creditInstitution()
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e)
    }
  }

  //FDI
  @ApiOperation({summary: 'Tổng số dự án đầu tư'})
  @ApiOkResponse({type: TotalInvestmentProjectsResponse})
  @Get('tong-so-du-an-dau-tu')
  async totalInvestmentProjects(@Res() res: Response, @Query() q: FDIOrderDto){
    try {
      const data = await this.macrosService.totalInvestmentProjects(+q.order)
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e)
    }
  }

  @Get('chi-so-dau-tu-nuoc-ngoai')
  @ApiOperation({summary: 'Chỉ số đầu tư nước ngoài'})
  @ApiOkResponse({type: ForeignInvestmentIndexResponse})
  async foreignInvestmentIndex(@Res() res: Response, @Query() q: ForeignInvestmentIndexDto){
    try {
      const data = await this.macrosService.foreignInvestmentIndex(q)
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e)
    }
  }

  @Get('luy-ke')
  @ApiOperation({summary: 'Lũy kế số dự án cấp mới và tổng vốn đầu tư từ năm 1988'})
  @ApiOkResponse({type: AccumulatedResponse})
  async accumulated(@Res() res: Response, @Query() q: FDIOrderDto){
    try {
      const data = await this.macrosService.accumulated(q)
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e)
    }
  }

  @Get('tong-von-dang-ky-va-giai-ngan')
  @ApiOperation({summary: 'Tổng vốn đăng ký và giải ngân (triệu USD)'})
  @ApiOkResponse({type: LaborForceResponse})
  async totalRegisteredAndDisbursed(@Res() res: Response, @Query() q: FDIOrderDto){
    try {
      const data = await this.macrosService.totalRegisteredAndDisbursed(q)
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e)
    }
  }

  //Trái phiếu

  @Get('tpdn-phat-hanh-thanh-cong-theo-tung-ky')
  @ApiOperation({summary: 'TPDN phát hành thành công theo từng kỳ '})
  @ApiOkResponse({type: LaborForceResponse})
  async corporateBondsIssuedSuccessfully(@Res() res: Response){
    try {
      const data = await this.macrosService.corporateBondsIssuedSuccessfully()
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e)
    }
  }

  @Get('lai-suat-trai-phieu-huy-dong-binh-quan')
  @ApiOperation({summary: 'Lãi suất trái phiếu huy động bình quân'})
  @ApiOkResponse({type: LaborForceResponse})
  async averageDepositInterestRate(@Res() res: Response){
    try {
      const data = await this.macrosService.averageDepositInterestRate()
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e)
    }
  }

  @Get('bang-doanh-nghiep-tong-du-no-va-lai-suat-tp-binh-quan')
  @ApiOperation({summary: 'Bảng doanh nghiệp, tổng dư nợ và lãi suất TP bình quân'})
  @ApiOkResponse({type: TotalOutstandingBalanceResponse})
  async totalOutstandingBalance(@Res() res: Response){
    try {
      const data = await this.macrosService.totalOutstandingBalance()
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e)
    }
  }

  @Get('uoc-tinh-gia-tri-tpdn-dao-han')
  @ApiOperation({summary: 'Ước tính giá trị TPDN đáo hạn theo từng kỳ'})
  @ApiOkResponse({type: CorporateBondsIssuedSuccessfullyResponse})
  async estimatedValueOfCorporateBonds(@Res() res: Response){
    try {
      const data = await this.macrosService.estimatedValueOfCorporateBonds()
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e)
    }
  }

  // @Get('danh-sach-trai-phieu-den-ky-dao-han')
  // @ApiOperation({summary: 'Ước tính giá trị TPDN đáo hạn theo từng kỳ'})
  // @ApiOkResponse({type: CorporateBondsIssuedSuccessfullyResponse})
  // async estimatedValueOfCorporateBonds(@Res() res: Response){
  //   try {
  //     const data = await this.macrosService.estimatedValueOfCorporateBonds()
  //     return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  //   } catch (e) {
  //     throw new CatchException(e)
  //   }
  // }
}

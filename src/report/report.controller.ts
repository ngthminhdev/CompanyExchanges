import { Controller, Get, HttpStatus, Post, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiOkResponse, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CatchException } from '../exceptions/common.exception';
import { BaseResponse } from '../utils/utils.response';
import { ReportService } from './report.service';
import { NewsEnterpriseResponse } from './response/newsEnterprise.response';
import { NewsInternationalResponse } from './response/newsInternational.response';

@Controller('report')
@ApiTags('Report')
export class ReportController {
  constructor(
    private readonly reportService: ReportService
    ) {}

  // @ApiOperation({summary: 'Chỉ số'})
  // @ApiOkResponse({status: HttpStatus.OK, type: ReportIndexResponse})
  // @Get('chi-so')
  // async getIndex(@Res() res: Response) {
  //   try {
  //     const data = await this.reportService.getIndex();
  //     return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  //   } catch (error) {
  //     throw new CatchException(error)
  //   }
  // }

  // @Post('upload')
  // @UseInterceptors(AnyFilesInterceptor())
  // async upload(@UploadedFiles() file: any){
  //   try {
  //     await this.reportService.uploadFile(file)
  //   } catch (error) {
  //     throw new CatchException(error)
  //   }
  // }

  @Post('upload-report')
  @UseInterceptors(AnyFilesInterceptor())
  async uploadReport(@UploadedFiles() file: any, @Res() res: Response){
    try {
      await this.reportService.uploadFileReport(file)
      return res.status(HttpStatus.OK).send(new BaseResponse({}))
    } catch (error) {
      throw new CatchException(error)
    }
  }

  @ApiOperation({summary: 'Tin quốc tế'})
  @ApiOkResponse({status: HttpStatus.OK, type: NewsInternationalResponse})
  @Get('tin-quoc-te')
  async newsInternational(@Res() res: Response){
    const data = await this.reportService.newsInternational()
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Tin trong nước'})
  @ApiOkResponse({status: HttpStatus.OK, type: NewsInternationalResponse})
  @Get('tin-trong-nuoc')
  async newsDomestic(@Res() res: Response){
    const data = await this.reportService.newsDomestic()
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Tin doanh nghiệp'})
  @ApiOkResponse({status: HttpStatus.OK, type: NewsEnterpriseResponse})
  @Get('tin-doanh-nghiep')
  async newsEnterprise(@Res() res: Response){
    const data = await this.reportService.newsEnterprise()
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Lịch sự kiện'})
  @ApiOkResponse({status: HttpStatus.OK, type: NewsEnterpriseResponse})
  @Get('lich-su-kien')
  async event(@Res() res: Response){
    const data = await this.reportService.event()
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Diễn biến kết phiên sáng'})
  @ApiOkResponse({status: HttpStatus.OK, type: NewsEnterpriseResponse})
  @Get('ket-phien-sang')
  async morning(@Res() res: Response){
    const data = await this.reportService.morning()
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Diễn biến kết phiên sáng'})
  @ApiOkResponse({status: HttpStatus.OK, type: NewsEnterpriseResponse})
  @Get('ket-phien-sang')
  async morningHose(@Res() res: Response){
    const data = await this.reportService.morningHose()
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }
}

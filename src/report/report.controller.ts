import { Controller, Get, HttpStatus, Post, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { CatchException } from '../exceptions/common.exception';
import { MinioOptionService } from '../minio/minio.service';
import { BaseResponse } from '../utils/utils.response';
import { ReportService } from './report.service';
import { ReportIndexResponse } from './response/index.response';

@Controller('report')
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
    private readonly minio: MinioOptionService
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
}

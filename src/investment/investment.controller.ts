import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InvestmentFilterDto } from './dto/investment-filter.dto';
import { InvestmentService } from './investment.service';

@Controller('investment')
@ApiTags('Investment')
export class InvestmentController {
  constructor(private readonly investmentService: InvestmentService) {}

  @Post('filter')
  filter(@Body() b: InvestmentFilterDto
  ) {
    return this.investmentService.filter(b);
  }
}

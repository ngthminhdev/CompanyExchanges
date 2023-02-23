import { ApiResponseProperty } from '@nestjs/swagger';

export class ExampleResponse {
  @ApiResponseProperty({
    type: Number,
    example: 1,
  })
  variable: number;

  constructor(data?: ExampleResponse | any) {
    this.variable = data?.variable ?? 0;
  }

  public mapToList(data?: ExampleResponse[] | any[]) {
    return data.map((item) => new ExampleResponse(item));
  }
}

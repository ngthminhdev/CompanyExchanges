export class BaseResponse {
  readonly status: number;
  readonly message: string;
  readonly data: any;

  constructor({ status, message, data }: Partial<BaseResponse>) {
    this.status = status || 200;
    this.message = message || 'success';
    this.data = data || null;
  }
}

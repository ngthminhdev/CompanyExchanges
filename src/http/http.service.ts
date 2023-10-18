import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { CatchException } from '../exceptions/common.exception';

@Injectable()
export class HttpConfigService {
  constructor(
    private readonly httpService: HttpService
  ){}
  async get(url: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(url).pipe(
          catchError((error: AxiosError) => {
            throw new CatchException(error)
          }),
        ),
      );
      return data;
    } catch (e) {
      throw new CatchException(e)
    }
  }

  async post(url: string, body: any, headers: any){
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(url, body, headers).pipe(
          catchError((error: AxiosError) => {
            throw new CatchException(error)
          }),
        ),
      );
      return data;
    } catch (e) {
      throw new CatchException(e)
    }
  }
}

import { ValidationError } from '@nestjs/common';
import * as moment from 'moment';
import * as _ from 'lodash';
export class UtilCommonTemplate {
  static toDateTime(value?: any): any | string {
    if (!value) {
      return '';
    }
    return moment(value).utcOffset(420).format('YYYY/MM/DD HH:mm:ss');
  }

  static toTime(value?: any): any | string {
    if (!value) {
      return moment().utcOffset(420).format('HH:mm:ss');
    }
    return moment(value).utcOffset(420).format('HH:mm:ss');
  }

  static toDateNumber(value?: any): number {
    if (!value) {
      return 0;
    }
    return moment(value).utcOffset(420).valueOf();
  }

  static toDateNumberUTC(value?: any): number {
    if (!value) {
      return 0;
    }
    return moment(value).utc().add(1, 'day').valueOf();
  }

  static toDate(value: any): any {
    if (!value) {
      return '';
    }
    return moment(value).utcOffset(420).format('YYYY/MM/DD');
  }

  static getMessageValidator(errors: ValidationError[]) {
    return errors
      .map((item) => {
        return Object.keys(item.constraints)
          .map((obj) => item.constraints[obj])
          .join(',');
      })
      .join(',');
  }

  static uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }

  static generateDeviceId(mac: string, userAgent: string) {
    // Chuyển đổi chuỗi thành mảng byte
    const arr1 = mac.split(':').map((x) => parseInt(x, 16));
    const arr2 = new TextEncoder().encode(userAgent);

    // Tạo một ArrayBuffer có kích thước đủ để chứa cả hai mảng byte
    const buffer = new ArrayBuffer(arr1.length + arr2.length);

    // Ghi hai mảng byte vào ArrayBuffer
    const view = new DataView(buffer);
    arr1.forEach((val, index) => view.setUint8(index, val));
    arr2.forEach((val, index) => view.setUint8(arr1.length + index, val));

    // Tạo UUID từ ArrayBuffer
    const uuidBytes = new Uint8Array(buffer);
    uuidBytes[6] = (uuidBytes[6] & 0x0f) | 0x40; // version 4
    uuidBytes[8] = (uuidBytes[8] & 0x3f) | 0x80; // variant 1
    const uuid = Array.from(uuidBytes)
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('');
    return uuid.slice(0, 25);
  }

  static fileNameRegex(fileName: string): string {
    return (
      fileName
        .slice(0, fileName.lastIndexOf('.'))
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f\s]/g, '')
        .replace(/\s+/g, '-') + this.uuid()
    );
  }

  static getFileExt(fileName: string): string {
    return fileName.slice(fileName.lastIndexOf('.') + 1, fileName.length);
  }

  static generateOTP(): string {
    return Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
  }

  static getTop10HighestAndLowestData(data: any[], field: string) {
    const sortedData = _.orderBy(data, field, 'desc');
    const top10Highest = _.take(sortedData, 10);
    const top10Lowest = _.take(_.reverse(sortedData), 10);
    return [...top10Highest, ...top10Lowest];
  }
}

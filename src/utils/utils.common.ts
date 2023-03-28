import { ValidationError } from '@nestjs/common';
import * as moment from 'moment';
export class UtilCommonTemplate {
  static toDateTime(value?: any): Date | string {
    if (!value) {
      return '';
    }
    return moment(value).utcOffset(420).format('YYYY/MM/DD HH:mm:ss');
  }

  static toTimestamp(value: any) {
    if (!value) {
      return '';
    }
    return moment(value).format('DD/MM/YYYY');
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
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  static generateDeviceId(str1: string, str2: string) {
    // Chuyển đổi chuỗi thành mảng byte
    const arr1 = str1.split(':').map(x => parseInt(x, 16));
    const arr2 = new TextEncoder().encode(str2);

    // Tạo một ArrayBuffer có kích thước đủ để chứa cả hai mảng byte
    const buffer = new ArrayBuffer(arr1.length + arr2.length);

    // Ghi hai mảng byte vào ArrayBuffer
    const view = new DataView(buffer);
    arr1.forEach((val, index) => view.setUint8(index, val));
    arr2.forEach((val, index) => view.setUint8(arr1.length + index, val));

    // Tạo UUID từ ArrayBuffer
    const uuidBytes = new Uint8Array(buffer);
    uuidBytes[6] = (uuidBytes[6] & 0x0f) | 0x40;  // version 4
    uuidBytes[8] = (uuidBytes[8] & 0x3f) | 0x80;  // variant 1
    const uuid = Array.from(uuidBytes).map(x => x.toString(16).padStart(2, '0')).join('');
    return uuid.slice(0, 25)
  }

}

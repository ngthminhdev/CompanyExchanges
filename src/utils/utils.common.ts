import { ValidationError } from '@nestjs/common';
import * as moment from 'moment';
export class UtilCommonTemplate {
  static toDateTime(value?: any) {
    if (!value) {
      return '';
    }
    return moment(value).utcOffset(420).format('MM-DD-YYYY HH:mm:ss');
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
}

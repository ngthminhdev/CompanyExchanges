import { ValidationError } from '@nestjs/common';
import * as moment from 'moment';
export class UtilCommonTemplate {
  static toDateTime(value?: any) {
    if (!value) {
      return '';
    }
    return moment(value).format('MM-DD-YYYY HH:mm:ss');
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
    return moment(value, 'DD/MM/YYYY').toDate();
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

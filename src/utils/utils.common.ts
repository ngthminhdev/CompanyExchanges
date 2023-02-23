import { ValidationError } from '@nestjs/common';
import * as moment from 'moment';

export const convertToSlug = (str: string): string => {
  if (!str) return '';
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  const from =
    'àáạãảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ·/_,:;';
  const to =
    'aaaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd------';
  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes

  return str;
};

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

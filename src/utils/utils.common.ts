import { ValidationError } from '@nestjs/common';
import * as moment from 'moment';
import * as _ from 'lodash';
import { TimeTypeEnum } from '../enums/common.enum';
import { industryMapping } from '../market/mapping/industry.mapping';
import { IPPIndustyMapping } from '../macro/mapping/ipp-industry.mapping';
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

  static toDateV2(value: any): any {
    if (!value) {
      return '';
    }
    return moment(value).utcOffset(420).format('DD-MM-YYYY');
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

  static generateDeviceId(userAgent: string, mac: string) {
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

  static getPastDate(
    count: number,
    type: number = TimeTypeEnum.Quarter,
    date: moment.Moment | Date | string = new Date(),
    results = [],
  ): string[] {
    if (count === 0) {
      return results;
    }
    let previousEndDate: moment.Moment | Date | string;
    if (type === TimeTypeEnum.Year) {
      previousEndDate = moment(date).subtract(1, 'years').endOf('year');
    } else {
      previousEndDate = moment(date).subtract(1, 'quarter').endOf('quarter');
    }
    results.push(previousEndDate.format('YYYY/MM/DD'));

    return this.getPastDate(count - 1, type, previousEndDate, results);
  }

  static getPastDateV2(
    count: number,
    type: number = TimeTypeEnum.Quarter,
    date: moment.Moment | Date | string = new Date(),
    results = [],
  ): string[] {
    if (count === 0) {
      return results;
    }
    let previousEndDate: moment.Moment | Date | string;
    if (type === TimeTypeEnum.Year) {
      if (!results.length) {
        count--;
        results.push(
          moment(date)
            .subtract(1, 'quarter')
            .endOf('quarter')
            .startOf('month')
            .format('YYYY-MM-DD'),
        );
      }
      previousEndDate = moment(date)
        .subtract(5, 'quarter')
        .endOf('quarter')
        .startOf('month');
    } else {
      previousEndDate = moment(date)
        .subtract(1, 'quarter')
        .endOf('quarter')
        .startOf('month');
    }
    results.push(previousEndDate.format('YYYY-MM-DD'));

    return this.getPastDateV2(count - 1, type, previousEndDate, results);
  }

  static getYearQuarters(
    count: number,
    type: number = TimeTypeEnum.Quarter,
    date: moment.Moment | Date | string = new Date(),
    results = [],
  ): string[] {
    if (count === 0) {
      return results;
    }
    let previousEndDate: moment.Moment | Date | string;
    if (type === TimeTypeEnum.Year) {
      previousEndDate = moment(date).subtract(1, 'years').endOf('year');
    } else {
      previousEndDate = moment(date).subtract(1, 'quarter').endOf('quarter');
    }
    const resultDate = `${previousEndDate.year()}${previousEndDate.quarter()}`;
    results.push(resultDate);

    return this.getYearQuarters(count - 1, type, previousEndDate, results);
  }

  static getYearQuartersV2(
    count: number,
    type: number = TimeTypeEnum.Quarter,
    date: moment.Moment | Date | string = new Date(),
    results = [],
  ): string[] {
    if (count === 0) {
      return results;
    }
    let previousEndDate: moment.Moment | Date | string;
    let resultDate: moment.Moment | Date | string;
    if (type === TimeTypeEnum.Year) {
      previousEndDate = moment(date).subtract(1, 'years').endOf('year');
      resultDate = `${previousEndDate.year()}0`;
    } else {
      previousEndDate = moment(date).subtract(1, 'quarter').endOf('quarter');
      resultDate = `${previousEndDate.year()}${previousEndDate.quarter()}`;
    }
    results.push(resultDate);
    return this.getYearQuarters(count - 1, type, previousEndDate, results);
  }

  static getIndustryFilter(input: string[]): string {
    if (!input[0]) return `(' ')`;
    return `(${input.map((name) => industryMapping[name]).join(', ')})`;
  }

  static getIPPIndustryFilter(input: string[]): string {
    if (!input[0]) return `(' ')`;
    return `(${input.map((name) => IPPIndustyMapping[name]).join(', ')})`;
  }

  static getDateFilter(input: string[]) {
    const filteredDates = input.filter((date) => date !== '');
    return {
      startDate: filteredDates[filteredDates.length - 1],
      endDate: filteredDates[0],
      dateFilter: `(${filteredDates.map((date) => `'${date}'`).join(', ')})`,
    };
  }

  static getPreviousMonth(date: Date = new Date(), order: number, type: number = 0) {
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();

    const threeMonthsAgo = new Date(currentYear, currentMonth - (order - 1), 1);

    const previousThreeMonths = [];

    for (let i = 0; i < order; i++) {
      type == 0 ? previousThreeMonths.push(moment(threeMonthsAgo).format('YYYY-MM-01')) : previousThreeMonths.push(moment(threeMonthsAgo).endOf('month').format('YYYY-MM-DD'))
      
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() + 1);
    }

    return previousThreeMonths;
  }

  static getDateFilterV2(input: string[]) {
    const filteredDates = input.filter((date) => date !== '');
    return {
      startDate: filteredDates[filteredDates.length - 1],
      endDate: filteredDates[0],
      dateFilter: `(${filteredDates
        .map((date) => `'${date} 00:00:00.000'`)
        .join(', ')})`,
    };
  }

  static transformData(arr, obj) {
    const transformedArr = [];

    arr.forEach((item) => {
      const transformedItem = transformedArr.find(
        (transformedItem) => transformedItem.code === item.code,
      );

      if (transformedItem) {
        if (this.toDate(item.date) === obj.lastFiveDate) {
          transformedItem.perFive = item.perChange ?? 0;
        } else if (this.toDate(item.date) === obj.lastQuarterDate) {
          transformedItem.perQuarter = item.perChange ?? 0;
        } else if (this.toDate(item.date) === obj.firstYearDate) {
          transformedItem.perYtd = item.perChange ?? 0;
        } else if (this.toDate(item.date) === obj.lastYearDate) {
          transformedItem.perYtY = item.perChange ?? 0;
        }
      } else {
        const newItem = {
          code: item.code,
          perFive: '',
          perQuarter: '',
          perYtd: '',
          perYtY: '',
        };

        if (this.toDate(item.date) === obj.lastFiveDate) {
          newItem.perFive = item.perChange ?? 0;
        } else if (this.toDate(item.date) === obj.lastQuarterDate) {
          newItem.perQuarter = item.perChange ?? 0;
        } else if (this.toDate(item.date) === obj.firstYearDate) {
          newItem.perYtd = item.perChange ?? 0;
        } else if (this.toDate(item.date) === obj.lastYearDate) {
          newItem.perYtY = item.perChange ?? 0;
        }

        transformedArr.push(newItem);
      }
    });

    return transformedArr;
  }

  static transformDataLiquid(arr, obj) {
    const transformedArr = [];

    arr.forEach((item) => {
      const transformedItem = transformedArr.find(
        (transformedItem) => transformedItem.code === item.code,
      );

      if (transformedItem) {
        if (this.toDate(item.date) === obj.secondQuarterDate) {
          transformedItem.perQuarter = item.perChange ?? 0;
        } else if (this.toDate(item.date) === obj.yearQuarterDate) {
          transformedItem.perQuarterLastYear = item.perChange ?? 0;
        } else if (this.toDate(item.date) === obj.fourYearsDate) {
          transformedItem.perFourYear = item.perChange ?? 0;
        }
      } else {
        const newItem = {
          code: item.code,
          perQuarter: '',
          perQuarterLastYear: '',
          perFourYear: '',
        };

        if (this.toDate(item.date) === obj.secondQuarterDate) {
          newItem.perQuarter = item.perChange ?? 0;
        } else if (this.toDate(item.date) === obj.yearQuarterDate) {
          newItem.perQuarterLastYear = item.perChange ?? 0;
        } else if (this.toDate(item.date) === obj.fourYearsDate) {
          newItem.perFourYear = item.perChange ?? 0;
        }

        transformedArr.push(newItem);
      }
    });

    return transformedArr;
  }

  static transformEquityData(arr) {
    const transformedArr = [];

    arr.forEach((item) => {
      const transformedItem = transformedArr.find(
        (transformedItem) => transformedItem.code === item.code,
      );

      if (transformedItem) {
        if (item.report === 'lãi chưa phân phối') {
          transformedItem.laiChuPhanPhoi = item.perChange ?? 0;
        } else if (item.report === 'lợi ích cổ đông không kiểm soát') {
          transformedItem.loiIchCoDong = item.perChange ?? 0;
        } else if (item.report === 'vốn chủ sở hữu') {
          transformedItem.vonChuSoHuu = item.perChange ?? 0;
        } else if (item.report === 'thặng dư vốn cổ phần') {
          transformedItem.thangDuVon = item.perChange ?? 0;
        }
      } else {
        const newItem = {
          code: item.code,
          laiChuPhanPhoi: 0,
          loiIchCoDong: 0,
          vonChuSoHuu: 0,
          thangDuVon: 0,
        };

        if (item.report === 'lãi chưa phân phối') {
          newItem.laiChuPhanPhoi = item.perChange ?? 0;
        } else if (item.report === 'lợi ích cổ đông không kiểm soát') {
          newItem.loiIchCoDong = item.perChange ?? 0;
        } else if (item.report === 'vốn chủ sở hữu') {
          newItem.vonChuSoHuu = item.perChange ?? 0;
        } else if (item.report === 'thặng dư vốn cổ phần') {
          newItem.thangDuVon = item.perChange ?? 0;
        }

        transformedArr.push(newItem);
      }
    });

    return transformedArr;
  }

  static transformLiabilitiesData(arr) {
    const transformedArr = [];

    arr.forEach((item) => {
      const transformedItem = transformedArr.find(
        (transformedItem) => transformedItem.code === item.code,
      );

      if (transformedItem) {
        if (item.report === 'nợ ngắn hạn') {
          transformedItem.noNganHan = item.perChange ?? 0;
        } else if (item.report === 'nợ dài hạn') {
          transformedItem.noDaiHan = item.perChange ?? 0;
        } else if (item.report === 'vốn chủ sở hữu') {
          transformedItem.tiSoThanhToanNhanh = item.perChange ?? 0;
        }
      } else {
        const newItem = {
          code: item.code,
          noNganHan: 0,
          noDaiHan: 0,
          tiSoThanhToanNhanh: 0,
        };

        if (item.report === 'nợ ngắn hạn') {
          newItem.noNganHan = item.perChange ?? 0;
        } else if (item.report === 'nợ dài hạn') {
          newItem.noDaiHan = item.perChange ?? 0;
        } else if (item.report === 'vốn chủ sở hữu') {
          newItem.tiSoThanhToanNhanh = item.perChange ?? 0;
        }
        transformedArr.push(newItem);
      }
    });

    return transformedArr;
  }

  static generateColor(input: Date | string): string {
    if (!input) return '';

    const inputString = typeof input === 'string' ? input : input.toString();
    let hash = 0;

    for (let i = 0; i < inputString.length; i++) {
      hash = inputString.charCodeAt(i) + ((hash << 5) - hash);
    }

    const blueLevels = [100, 120, 140, 160, 180, 200, 220, 240, 255];
    const blueLevelIndex = Math.abs(hash) % blueLevels.length;
    const blueLevel = blueLevels[blueLevelIndex];

    const color = blueLevel.toString(16).toUpperCase().padStart(2, '0');
    return `#00${color}FF`;
  }

  static getLastTwoQuarters(date: string) {
    let currentDate = new Date(date);
    let currentMonth = currentDate.getMonth() + 1; // Tháng hiện tại (tính từ 0 đến 11)
    let currentQuarter = Math.ceil(currentMonth / 3); // Quý hiện tại
    let currentYear = currentDate.getFullYear(); // Năm hiện tại
    let quarters = [];


    if (currentMonth == 1 || currentMonth == 2) {
        quarters.push({ quarter: 3, year: currentYear - 1 });
        quarters.push({ quarter: 4, year: currentYear - 1 });
    } else if (currentMonth == 4 || currentMonth == 5 || currentMonth == 3) {
        quarters.push({ quarter: 4, year: currentYear - 1 });
        quarters.push({ quarter: 1, year: currentYear });
    } else if (currentMonth == 6 || currentMonth == 9 || currentMonth == 12) {
        quarters.push({ quarter: currentQuarter - 1, year: currentYear });
        quarters.push({ quarter: currentQuarter, year: currentYear });
    } else {
        quarters.push({ quarter: currentQuarter - 2, year: currentYear });
        quarters.push({ quarter: currentQuarter - 1, year: currentYear });
    }

    let months = [];

    quarters.forEach((quarter) => {
        let startMonth = (quarter.quarter - 1) * 3 + 1;
        let endMonth = quarter.quarter * 3;
        for (let month = startMonth; month <= endMonth; month++) {
            let monthStr = moment(month + "/" + quarter.year, 'MM/YYYY').format('YYYY/MM/01');
            months.push(monthStr);
        }
    });
    return {months, quarters: quarters.map(item => `${item.year}${item.quarter}`)};
}
}

export enum Topics {
  DoRongThiTruong = 'kafka-do-rong-thi-truong-topic',
  ThanhKhoanPhienHienTai = 'kafka-thanh-khoan-phien-hien-tai-topic',
  PhanNganh = 'kafka-phan-nganh-topic'
}

export const requestPatterns: string[] = [
    Topics.DoRongThiTruong,
    Topics.ThanhKhoanPhienHienTai,
    Topics.PhanNganh
];

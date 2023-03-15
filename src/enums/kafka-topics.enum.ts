export enum Topics {
  DoRongThiTruong = 'kafka-do-rong-thi-truong-topic',
  ThanhKhoanPhienHienTai = 'kafka-thanh-khoan-phien-hien-tai-topic',
  ThanhKhoanPhienTruoc = 'kafka-thanh-khoan-phien-truoc-topic',
}

export const requestPatterns: string[] = [
    Topics.DoRongThiTruong,
    Topics.ThanhKhoanPhienHienTai,
    Topics.ThanhKhoanPhienTruoc
];

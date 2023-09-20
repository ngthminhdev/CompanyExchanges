interface EmulatorInvestmentInterface {
    value: number,
    so_tien_thu_duoc_danh_muc_1: number,
    so_tien_thu_duoc_danh_muc_2: number,
    so_tien_thu_duoc_danh_muc_3: number,
    loi_nhuan_danh_muc_1: number,
    loi_nhuan_danh_muc_2: number,
    loi_nhuan_danh_muc_3: number,
    lai_thap_nhat_danh_muc_1: number,
    lai_thap_nhat_danh_muc_2: number,
    lai_thap_nhat_danh_muc_3: number,
    lai_cao_nhat_danh_muc_1: number,
    lai_cao_nhat_danh_muc_2: number,
    lai_cao_nhat_danh_muc_3: number,
    lai_trung_binh_danh_muc_1: number,
    lai_trung_binh_danh_muc_2: number,
    lai_trung_binh_danh_muc_3: number,
    loi_nhuan_am_cao_nhat_danh_muc_1: number,
    loi_nhuan_am_cao_nhat_danh_muc_2: number,
    loi_nhuan_am_cao_nhat_danh_muc_3: number,
    sharpe_1: number,
    sharpe_2: number,
    sharpe_3: number,
    beta_1: number,
    beta_2: number,
    beta_3: number,
    alpha_1: number,
    alpha_2: number,
    alpha_3: number
}
export class EmulatorInvestmentResponse {

    static mapToList(data?: EmulatorInvestmentInterface) {
        console.log(data);
        
        return {
            data_1: [
                {
                    name: 'Danh mục 1',
                    von_ban_dau: data.value,
                    thu_duoc: data.so_tien_thu_duoc_danh_muc_1,
                    loi_nhuan: data.loi_nhuan_danh_muc_1,
                    lai_thap_nhat: data.lai_thap_nhat_danh_muc_1,
                    lai_cao_nhat: data.lai_cao_nhat_danh_muc_1,
                    lai_trung_binh: data.lai_trung_binh_danh_muc_1,
                    lo_cao_nhat: data.loi_nhuan_am_cao_nhat_danh_muc_1,
                    sharpe: data.sharpe_1,
                    beta: data.beta_1,
                    alpha: data.alpha_1,
                },
                {
                    name: 'Danh mục 2',
                    von_ban_dau: data.value,
                    thu_duoc: data.so_tien_thu_duoc_danh_muc_2,
                    loi_nhuan: data.loi_nhuan_danh_muc_2,
                    lai_thap_nhat: data.lai_thap_nhat_danh_muc_2,
                    lai_cao_nhat: data.lai_cao_nhat_danh_muc_2,
                    lai_trung_binh: data.lai_trung_binh_danh_muc_2,
                    lo_cao_nhat: data.loi_nhuan_am_cao_nhat_danh_muc_2,
                    sharpe: data.sharpe_2,
                    beta: data.beta_2,
                    alpha: data.alpha_2,
                },
                {
                    name: 'Danh mục 3',
                    von_ban_dau: data.value,
                    thu_duoc: data.so_tien_thu_duoc_danh_muc_3,
                    loi_nhuan: data.loi_nhuan_danh_muc_3,
                    lai_thap_nhat: data.lai_thap_nhat_danh_muc_3,
                    lai_cao_nhat: data.lai_cao_nhat_danh_muc_3,
                    lai_trung_binh: data.lai_trung_binh_danh_muc_3,
                    lo_cao_nhat: data.loi_nhuan_am_cao_nhat_danh_muc_3,
                    sharpe: data.sharpe_3,
                    beta: data.beta_3,
                    alpha: data.alpha_3,
                }
            ]
        }
    }
}
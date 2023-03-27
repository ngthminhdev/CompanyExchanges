export interface RsiInterface {
    transaction_value: number;
    industry: string;
    date_time: Date | string;
}

export interface TransactionGroup {
    cashGain: number;
    cashLost: number;
}
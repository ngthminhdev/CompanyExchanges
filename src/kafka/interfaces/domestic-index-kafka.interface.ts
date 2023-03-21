export interface DomesticIndexKafkaInterface {
    name: string;
    price: number;
    lastUpdated: Date;
    "1D": number;
    "%1D": string;
    "5D": number;
    "%5D": string;
    MTD: number;
    "%MTD": string;
    YTD: number;
    "%YTD": string;
}
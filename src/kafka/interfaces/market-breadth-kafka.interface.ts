export interface MarketBreadthKafkaInterface {
    index: string;
    noChange: number;
    decline: number;
    advance:  number;
    time: Date | string | any
}
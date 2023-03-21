import {DomesticIndexKafkaInterface} from "../interfaces/domestic-index-kafka.interface";
import {UtilCommonTemplate} from "../../utils/utils.common";

export class DomesticIndexKafkaResponse {
    ticker: string;

    price: number;

    change_price: number;

    percent_d: number;

    lastUpdated: Date | string
    constructor(data?: DomesticIndexKafkaInterface) {
        this.ticker = data?.name || '';
        this.price = data?.price || 0;
        this.change_price = data?.["1D"]|| 0;
        this.percent_d = data?.["%1D"] ? +data?.["%1D"].slice(0, data?.["%1D"].length - 1) : 0;
        this.lastUpdated = UtilCommonTemplate.toDateTime(data?.lastUpdated) || "";
    }

    public mapToList(data?: DomesticIndexKafkaInterface[] | any[]) {
        return data.map(i => new DomesticIndexKafkaResponse(i))
    }
}
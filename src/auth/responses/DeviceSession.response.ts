import {ApiProperty, ApiResponseProperty, PartialType} from "@nestjs/swagger";
import {DeviceEntity} from "../entities/device.entity";
import {UtilCommonTemplate} from "../../utils/utils.common";
import {BaseResponse} from "../../utils/utils.response";


export class DeviceSessionResponse {
    @ApiResponseProperty({
        type: String,
    })
    device_id: string;

    @ApiResponseProperty({
        type: String,
    })
    mac_id: string;


    @ApiResponseProperty({
        type: String,
    })
    user_agent: string;

    @ApiResponseProperty({
        type: String,
    })
    ip_address: string;

    @ApiResponseProperty({
        type: String,
    })
    refresh_token: string;

    @ApiResponseProperty({
        type: Date,
    })
    created_at: Date | string;

    @ApiResponseProperty({
        type: Date,
    })
    expired_at: Date | string;

    constructor(data?: DeviceEntity) {
        this.device_id = data?.device_id || "";
        this.mac_id = data?.mac_id || "";
        this.user_agent = data?.user_agent || "";
        this.ip_address = data?.ip_address || "";
        this.refresh_token = data?.refresh_token || "";
        this.created_at = UtilCommonTemplate.toDateTime(data?.created_at || Date.now());
        this.expired_at = UtilCommonTemplate.toDateTime(data?.expired_at || Date.now());
    }

    public mapToList(data?: DeviceEntity[]) {
        return data.map(item => new DeviceSessionResponse(item))
    }
}

export class DeviceSessionSwagger extends PartialType(BaseResponse){
    @ApiProperty({
        type: DeviceSessionResponse,
        isArray: true
    })
    data: DeviceSessionResponse[]
}
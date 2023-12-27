import { ApiProperty } from "@nestjs/swagger"

export class IStockContribute {
    @ApiProperty({
        type: String
    })
    code: string

    @ApiProperty({
        type: Number
    })
    value: number

    constructor(data: any) {
        this.code = data?.code || ''
        this.value = data?.value || 0
    }

    static mapToList(data: any[]){
        return data.map(item => new IStockContribute(item))
    }
}

class IChart {
    @ApiProperty({
        type: Number
    })
    time: number

    @ApiProperty({
        type: Number
    })
    value: number
}

export class AfternoonReport1 {
    @ApiProperty({
        type: String,
        isArray: true,
        description: `Diễn biến thị trường`
    })
    text: string[]

    @ApiProperty({
        type: Number,
        description: `Giá đóng cửa VNINDEX`
    })
    closePrice: number

    @ApiProperty({
        type: Number,
        description: `Giá đóng cửa phiên trước VNINDEX`
    })
    prevClosePrice: number

    @ApiProperty({
        type: Number,
    })
    change: number

    @ApiProperty({
        type: Number,
    })
    perChange: number

    @ApiProperty({
        type: Number,
        description: `Tổng giá trị giao dịch`
    })
    totalVal: number

    @ApiProperty({
        type: Number,
        description: `% thay đổi giá trị giao dịch`
    })
    perChangeTotalVal: number

    @ApiProperty({
        type: Number,
        description: `Giá trị giao dịch khớp lệnh`
    })
    omVal: number

    @ApiProperty({
        type: Number,
        description: `% thay đổi giá trị giao dịch khớp lệnh`
    })
    perOmVal: number

    @ApiProperty({
        type: Number,
        description: `Giá trị giao dịch thoả thuận`
    })
    ptVal: number

    @ApiProperty({
        type: Number,
        description: `Giá trị giao dịch ròng khối ngoại`
    })
    netVal: number

    @ApiProperty({
        type: Number,
        description: `Mã tăng`
    })
    advances: number

    @ApiProperty({
        type: Number,
        description: `Mã giảm`
    })
    declines: number

    @ApiProperty({
        type: Number,
        description: `Không đổi`
    })
    noChange: number

    @ApiProperty({
        type: Number,
        description: `Mã trần`
    })
    ceilingStocks: number

    @ApiProperty({
        type: Number,
        description: `Mã sàn`
    })
    floorStocks: number

    @ApiProperty({
        type: Number,
        description: `Giá cao`
    })
    highPrice: number

    @ApiProperty({
        type: Number,
        description: `Giá thấp`
    })
    lowPrice: number

    @ApiProperty({
        type: Number,
        description: `Giá đóng cửa HNX`
    })
    hnxClosePrice: number

    @ApiProperty({
        type: Number,
    })
    hnxChange: number

    @ApiProperty({
        type: Number,
    })
    hnxPerChange: number

    @ApiProperty({
        type: Number,
        description: `Ngành đóng góp tăng nổi bật`
    })
    industryAdvance: IStockContribute

    @ApiProperty({
        type: Number,
        description: `Ngành đóng góp giảm nổi bật`
    })
    industryDecline: IStockContribute

    @ApiProperty({
        type: IStockContribute,
        isArray: true,
        description: `Cổ phiếu đóng góp tăng`
    })
    stockAdvance: IStockContribute[]

    @ApiProperty({
        type: IStockContribute,
        isArray: true,
        description: `Cổ phiếu đóng góp giảm`
    })
    stockDecline: IStockContribute[]

    @ApiProperty({
        type: IStockContribute,
        isArray: true,
        description: `Top cổ phiếu mua ròng`
    })
    topBuy: IStockContribute[]

    @ApiProperty({
        type: IStockContribute,
        isArray: true,
        description: `Top cổ phiếu bán ròng`
    })
    topSell: IStockContribute[]

    @ApiProperty({
        type: IChart,
        isArray: true,
        description: `Chart biến động chỉ số VNINDEX`
    })
    chart: IChart[]

    @ApiProperty({
        type: IStockContribute,
        isArray: true,
        description: `Chart Nhóm dẫn dắt thị trường sàn HOSE`
    })
    chartTopMarket: IStockContribute[]

    @ApiProperty({
        type: IStockContribute,
        isArray: true,
        description: `Chart Top Khối ngoại giao dịch ròng sàn HOSE`
    })
    chartTopForeign: IStockContribute[]

    @ApiProperty({
        type: IStockContribute,
        isArray: true,
        description: `Chart Top giá trị giao dịch sàn HOSE`
    })
    chartTopTotalVal: IStockContribute[]

    constructor(data?: AfternoonReport1) {
        this.text = data?.text || []
        this.closePrice = data?.closePrice || 0
        this.prevClosePrice = data?.prevClosePrice || 0
        this.change = data?.change || 0
        this.perChange = data?.perChange || 0
        this.totalVal = data?.totalVal || 0
        this.perChangeTotalVal = data?.perChangeTotalVal || 0
        this.omVal = data?.omVal || 0
        this.perOmVal = data?.perOmVal || 0
        this.ptVal = data?.ptVal || 0
        this.netVal = data?.netVal || 0
        this.advances = data?.advances || 0
        this.declines = data?.declines || 0
        this.noChange = data?.noChange || 0
        this.ceilingStocks = data?.ceilingStocks || 0
        this.floorStocks = data?.floorStocks || 0
        this.highPrice = data?.highPrice || 0
        this.lowPrice = data?.lowPrice || 0
        this.hnxClosePrice = data?.hnxClosePrice || 0
        this.hnxChange = data?.hnxChange || 0
        this.hnxPerChange = data?.hnxPerChange || 0
        this.industryAdvance = data?.industryAdvance
        this.industryDecline = data?.industryDecline
        this.stockAdvance = data?.stockAdvance || []
        this.stockDecline = data?.stockDecline || []
        this.topBuy = data?.topBuy || []
        this.topSell = data?.topSell || []
        this.chart = data?.chart || []
        this.chartTopMarket = data?.chartTopMarket || []
        this.chartTopForeign = data?.chartTopForeign || []
        this.chartTopTotalVal = data?.chartTopTotalVal || []
    }

}
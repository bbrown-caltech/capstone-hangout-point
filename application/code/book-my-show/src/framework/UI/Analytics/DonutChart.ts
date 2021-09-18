
interface DonutChartGraphSegment {
    Label: string;
    Total: number;
    Color: string;
    Class: string;
}

interface DonutChartConfig {
    GraphControlID: string;
    LegendControlID: string;
    TotalItems: number;
    ItemData: DonutChartGraphSegment[];
}

class DonutChart {
    
    constructor() {}
    
    display(data: DonutChartConfig) {
        const baseCanvas: HTMLCanvasElement = document.getElementById(data.GraphControlID) as HTMLCanvasElement;
        const baseContext: CanvasRenderingContext2D = baseCanvas.getContext('2d');
        const wid: number = baseCanvas.width;
        const hgt: number = baseCanvas.height;
        const x: number = baseCanvas.width / 2;
        const y: number = baseCanvas.height / 2;
        let start: number = 1.5;

        baseContext.clearRect(0, 0, wid, hgt);

        for (var i = 0; i < data.ItemData.length; i++) {
            start = this.DrawGraphSegment(baseContext, x, y, 75, data.TotalItems, data.ItemData[i].Total, start, data.ItemData[i].Color);
        }

        if (data.TotalItems === 0) {
            console.log('display');
            this.DrawGraphSegment(baseContext, x, y, 75, 1, 1, start, '#999');
        }

    }
    
    displayLegend(data: DonutChartConfig) {
        const baseCanvas: HTMLCanvasElement = document.getElementById(data.LegendControlID) as HTMLCanvasElement;
        const baseContext: CanvasRenderingContext2D = baseCanvas.getContext('2d');
        const wid: number = baseCanvas.width;
        const hgt: number = baseCanvas.height;
        const x: number = baseCanvas.width / 2;
        const y: number = baseCanvas.height / 2;
        let start: number = 1.5;

        baseContext.clearRect(0, 0, wid, hgt);

        for (var i = 0; i < data.ItemData.length; i++) {
            start = this.DrawGraphSegment(baseContext, x, y, 75, data.TotalItems, data.ItemData[i].Total, start, data.ItemData[i].Color);
        }

        if (data.TotalItems === 0) {
            console.log('displayLegend');
            this.DrawGraphSegment(baseContext, x, y, 75, 1, 1, start, '#999');
        }

    }
    
    private DrawText(cntx, caption, fnt, color, x, y, showShadow) {
        var offset = (23 * String(caption).length);
        
        cntx.font = fnt;
        cntx.fillStyle = color;

        if (showShadow) {
            cntx.shadowOffsetX = 10;
            cntx.shadowOffsetY = 10;
            cntx.shadowBlur = 10;
        }
        else {
            cntx.shadowOffsetX = 0;
            cntx.shadowOffsetY = 0;
            cntx.shadowBlur = 0;
        }

        cntx.shadowColor = '#999';
        cntx.fillText(caption, x - offset, y);
    }
    
    private DrawGraphSegment(cntxt, x, y, radius, grandTotal, subtotal, start, color) {
        var prcnt = subtotal / grandTotal;
        var increaseAmt = 2.0 * prcnt;
        var end = start + increaseAmt;

        if (end > 2.0) {
            end -= 2.0;
        }

        cntxt.beginPath();

        if (increaseAmt > 0) {
            cntxt.arc(x, y, radius, (start + 0.005) * Math.PI, (end - 0.005) * Math.PI, false);
            cntxt.lineWidth = 45;

            cntxt.strokeStyle = color;
            cntxt.stroke();
        }

        return end;
    }
    
}

export { DonutChart, DonutChartConfig, DonutChartGraphSegment };

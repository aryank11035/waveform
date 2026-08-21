import { Point } from "./point.js"

export class Line {
    constructor( color , lineWidth ,  yPos , lineNumber, waveAmplitude = 0, waveDelay = 0){
        this.lineNumber = lineNumber
        this.color = color
        this.lineWidth = lineWidth

        this.yPos = yPos
        this.waveAmplitude = waveAmplitude
        this.waveDelay = waveDelay
        this.points = []
        this.pointCount = 170
    }

    resize(stageWidth , stageHeight){
        this.stageWidth = stageWidth
        this.stageHeight = stageHeight

        const pointSpacing = this.stageWidth / (this.pointCount - 1)
        const waveCenter = this.stageWidth / 2
        const waveRadius = this.stageWidth * 0.4
        this.points = []

        for(let i = 0 ; i < this.pointCount ; i++){
            this.points.push(
                new Point(
                    i * 0.12,
                    i * pointSpacing,
                    this.yPos,
                    this.waveAmplitude,
                    waveCenter,
                    waveRadius,
                    this.waveDelay
                )
            )
        }

    }

    update(){
        for(let i = 0 ; i < this.points.length ; i++){
            this.points[i].update()
        }

    }

    draw(ctx){
        ctx.beginPath()
        ctx.moveTo(this.points[0].x, this.points[0].y)
        for(let i = 1 ; i < this.points.length ; i++){
            ctx.lineTo(this.points[i].x, this.points[i].y)
        }

        ctx.lineTo(this.stageWidth, this.stageHeight)
        ctx.lineTo(0, this.stageHeight)
        ctx.closePath()
        ctx.fillStyle = "black"
        ctx.fill()

        ctx.beginPath()
        ctx.strokeStyle = this.color
        ctx.lineWidth = this.lineWidth
        ctx.moveTo(this.points[0].x, this.points[0].y)
        for(let i = 1 ; i < this.points.length ; i++){
            ctx.lineTo(this.points[i].x, this.points[i].y)
        }

        ctx.stroke()
    }

}
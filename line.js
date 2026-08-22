import { Point } from "./point.js"

export class Line {
    constructor( color , lineWidth ,  yPos , lineNumber, waveAmplitude = 0, waveDelay = 0){
        this.lineNumber = lineNumber
        this.color = color
        this.lineWidth = lineWidth

        this.yPos = yPos
        this.waveAmplitude = waveAmplitude
        this.waveDelay = waveDelay
        this.baseColor = color
        this.activeColor = color
        this.energy = 0
        this.collisionOffset = 0
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
        const energyAmplitude = this.energy * 72
        for(let i = 0 ; i < this.points.length ; i++){
            const point = this.points[i]
            point.max = this.waveAmplitude + energyAmplitude
            point.update()
            point.y += this.collisionOffset
        }
        this.energy *= 0.92
        this.collisionOffset *= 0.82
        this.activeColor = this.energy > 0.01
            ? this.energyColor
            : this.baseColor

    }

    addEnergy(amount, color, collisionOffset = 0){
        this.energy = Math.min(1, this.energy + amount)
        this.energyColor = color
        this.collisionOffset += collisionOffset

    }

    getYAt(x){
        const index = Math.max(0, Math.min(this.points.length - 1, Math.round(x / this.stageWidth * (this.points.length - 1))))
        return this.points[index].y
    }

    hexToRgb(hex){
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 }
    }

    darkenColor(hex, factor) {
        const rgb = this.hexToRgb(hex)
        const r = Math.max(0, Math.floor(rgb.r * factor))
        const g = Math.max(0, Math.floor(rgb.g * factor))
        const b = Math.max(0, Math.floor(rgb.b * factor))
        return `rgb(${r}, ${g}, ${b})`
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
        
        if (this.energy > 0.01) {
            // Create gradient with one color range (bright to dark)
            const gradient = ctx.createLinearGradient(0, this.yPos - 50, 0, this.yPos + 50)
            gradient.addColorStop(0, this.activeColor)
            gradient.addColorStop(1, this.darkenColor(this.activeColor, 0.5))
            ctx.fillStyle = gradient
        } else {
            ctx.fillStyle = "black"
        }
        ctx.fill()

        if (this.energy <= 0.01) {
            ctx.beginPath()
            
            // Create radial gradient from center
            const centerX = this.stageWidth / 2
            const centerY = this.stageHeight / 2
            const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY)
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius)
            
            // Grayscale at center, color at edges
            const rgb = this.hexToRgb(this.activeColor)
            gradient.addColorStop(0, `rgb(128, 128, 128)`) // Grayscale center
            gradient.addColorStop(1, this.activeColor) // Full color at edges
            
            ctx.strokeStyle = gradient
            ctx.lineWidth = this.lineWidth
            ctx.moveTo(this.points[0].x, this.points[0].y)
            for(let i = 1 ; i < this.points.length ; i++){
                ctx.lineTo(this.points[i].x, this.points[i].y)
            }
            ctx.stroke()
        }
    }

}
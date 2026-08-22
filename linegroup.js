import { Line } from "./line.js";

export class LineGroup {
    constructor(){
        this.totalLines = 30;
        
        this.lines = []
        this.collisionCounts = new Map()

        for(let i = 0 ; i < this.totalLines ; i++){

            const centerLine = Math.floor(this.totalLines / 2);
            const distanceFromCenter = Math.abs(i - centerLine);
            const movingRadius = 8;
            const isMovingLine = distanceFromCenter <= movingRadius;
            const isNeighborLine = distanceFromCenter === movingRadius + 1;
            const distanceFromEdge = Math.min(i, this.totalLines - 1 - i);
            const edgeFactor = Math.min(1, distanceFromEdge / 4);
            const opacity = i <= 7
                ? 0.1 + (i / 7) * 0.9
                : 1;
            const color = `rgba(255, 255, 255, ${opacity})`;
            const baseAmplitude = isMovingLine
                ? Math.max(0, 72 - distanceFromCenter * 8)
                : isNeighborLine
                    ? 4
                    : 1;
            const waveAmplitude = baseAmplitude * edgeFactor;
            const waveDelay = (i - (centerLine - movingRadius)) * 1.2;
            const line = new Line(
                color,
                0.6,
                0,
                i,
                waveAmplitude,
                waveDelay
            )

            this.lines[i] = line
        }

    }

    resize(stageWidth , stageHeight){
        for(let i = 0 ; i < this.totalLines ;i++){
            const line = this.lines[i]
            line.yPos = (stageHeight / (this.totalLines - 1)) * i
            line.resize(stageWidth , stageHeight)
        }
    }

    draw(ctx){
        for(let i = 0 ; i < this.totalLines ;i++){
            const line = this.lines[i]
            line.draw(ctx)
        }
    }

    triggerNote(midi, velocity){
        const centerLine = (this.totalLines - 1) / 2
        const centerSpread = 5
        const pitchProgress = Math.max(0, Math.min(1, (midi - 36) / 48))
        const row = Math.round(centerLine + (0.5 - pitchProgress) * centerSpread * 2)
        const lineIndex = Math.max(0, Math.min(this.totalLines - 1, row))
        const color = `hsl(${35 + pitchProgress * 185} 80% 78%)`
        const collisionCount = this.collisionCounts.get(lineIndex) || 0
        const offset = collisionCount % 2 === 0 ? -3 : 3
        this.collisionCounts.set(lineIndex, collisionCount + 1)

        for(let bleed = -1 ; bleed <= 1 ; bleed++){
            const target = lineIndex + bleed
            if(target < 0 || target >= this.totalLines) continue
            const bleedStrength = bleed === 0 ? 1 : 0.32
            this.lines[target].addEnergy(velocity * bleedStrength, color, bleed === 0 ? offset : 0)
        }
    }

    getLineIndexAt(x, y){
        let closestLine = 0
        let closestDistance = Infinity

        for(let i = 0 ; i < this.lines.length ; i++){
            const distance = Math.abs(this.lines[i].getYAt(x) - y)
            if(distance < closestDistance){
                closestDistance = distance
                closestLine = i
            }
        }

        return closestLine
    }

    update(){
        for(let i = 0 ; i < this.totalLines ; i++){
            this.lines[i].update()
        }
    }

    
}
import { Line } from "./line.js";

export class LineGroup {
    constructor(){
        this.totalLines = 30;
        
        this.lines = []

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
                0.8,
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

    update(){
        for(let i = 0 ; i < this.totalLines ; i++){
            this.lines[i].update()
        }
    }

    
}
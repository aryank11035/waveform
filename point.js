export class Point {
    constructor(index, x, y, max = 0, waveCenter = 0, waveRadius = 0, delay = 0) {
        this.cur = index + delay
        this.x = x
        this.y = y
        this.fixedY = y
        this.speed = 0.003
        this.max = max
        this.waveCenter = waveCenter
        this.waveRadius = waveRadius
    }

    update() {
        this.cur += this.speed
        const distanceFromCenter = Math.abs(this.x - this.waveCenter)
        const envelope = this.waveRadius > 0
            ? Math.pow(Math.max(0, 1 - distanceFromCenter / this.waveRadius), 2)
            : 0

        const wave = Math.sin(this.cur)
            + Math.sin(this.cur * 2.4) * 0.5
            + Math.sin(this.cur * 4.8) * 0.25
        const emphasizedWave = wave < 0 ? wave * 2 : wave;

        this.y = this.fixedY + emphasizedWave * this.max * envelope
    }
}

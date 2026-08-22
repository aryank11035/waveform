import { LineGroup } from "./linegroup.js"
import { Sequencer } from "./sequencer.js"

class App{
    constructor(){
        this.canvas = document.createElement("canvas")
        this.ctx = this.canvas.getContext("2d")

        document.body.appendChild(this.canvas)

        this.playNoteButton = document.querySelector("#playNote")
        this.playNoteButton.addEventListener("click", this.playSong.bind(this))
        this.sequencer = new Sequencer((note, gain) => {
            this.lineGroup.triggerNote(this.midiFromName(note.name), gain)
        })

        this.lineGroup = new LineGroup();
        // this.addImage("./waveform.png")
        window.addEventListener("resize" , this.resize.bind(this) , false)
        this.resize()
        requestAnimationFrame(this.animate.bind(this))
    }

    async playSong(){
        if(this.sequencer.playing){
            this.sequencer.stop()
            this.playNoteButton.textContent = "Play song"
            return
        }
        this.playNoteButton.disabled = true
        this.playNoteButton.textContent = "Loading piano..."

        try{
            await this.sequencer.start()
            this.playNoteButton.textContent = "Stop song"
        }catch(error){
            console.error(error)
            this.playNoteButton.textContent = "Audio failed"
        }finally{
            this.playNoteButton.disabled = false
        }
    }

    midiFromName(name){
        const match = name.match(/^([A-G]#?)(-?\d+)$/)
        const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
        return (Number(match[2]) + 1) * 12 + names.indexOf(match[1])
    }

    scheduleNotes(now){
        this.sequencer.update(now)
        if(!this.sequencer.playing && this.playNoteButton.textContent === "Stop song"){
            this.playNoteButton.textContent = "Play song"
        }
    }

    resize(){
        this.stageWidth = window.innerWidth
        this.stageHeight = window.innerHeight

        this.canvas.width = this.stageWidth
        this.canvas.height = this.stageHeight

        this.lineGroup.resize(this.stageWidth , this.stageHeight)
    }

    addImage(source){
        this.image = new Image()
        this.image.onload = () => {
            this.imageLoaded = true
        }
        this.image.src = source
    }

    drawImage(){
        if(!this.imageLoaded) return

        const maxWidth = this.stageWidth * 0.6
        const maxHeight = this.stageHeight * 0.6
        const scale = Math.min(
            maxWidth / this.image.naturalWidth,
            maxHeight / this.image.naturalHeight
        )
        const width = this.image.naturalWidth * scale
        const height = this.image.naturalHeight * scale
        const x = (this.stageWidth - width) / 2
        const y = (this.stageHeight - height) / 2

        this.ctx.drawImage(this.image, x, y, width, height)
    }

    animate(t){
        this.ctx.clearRect( 0 , 0 , this.stageWidth , this.stageHeight)
        this.drawImage()
        this.scheduleNotes(t)
        this.lineGroup.update()
        this.lineGroup.draw(this.ctx)
        requestAnimationFrame(this.animate.bind(this))
    }
}

window.onload = () => {
    new App();
}
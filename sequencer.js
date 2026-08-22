import Soundfont from "https://esm.sh/soundfont-player@0.12"
import { notes } from "./note-events.js"

export class Sequencer {
    constructor(onNote) {
        this.bpm = 80
        this.secondsPerBeat = 60 / this.bpm
        this.notes = notes
        this.onNote = onNote
        this.audioContext = null
        this.masterGain = null
        this.instrument = null
        this.startedAt = null
        this.nextNoteIndex = 0
        this.loading = false
        this.playing = false
    }

    async start() {
        if(this.loading || this.playing) return

        await this.loadInstrument()
        this.startedAt = performance.now()
        this.nextNoteIndex = 0
        this.playing = true
        this.loading = false
    }

    async loadInstrument(){
        if(this.instrument) return

        this.loading = true
        this.audioContext = this.audioContext || new (window.AudioContext || window.webkitAudioContext)()
        await this.audioContext.resume()
        if(!this.masterGain){
            this.masterGain = this.audioContext.createGain()
            this.masterGain.gain.value = 10
            this.masterGain.connect(this.audioContext.destination)
        }
        this.instrument = await Soundfont.instrument(
            this.audioContext,
            "acoustic_grand_piano",
            {
                soundfont: "MusyngKite",
                destination: this.masterGain
            }
        )
        this.loading = false
    }

    async playChord(rootMidi){
        await this.loadInstrument()
        const chord = [rootMidi, rootMidi + 4, rootMidi + 7]
        const now = this.audioContext.currentTime
        chord.forEach((midi, index) => {
            const note = {
                midi,
                name: this.midiToName(midi),
                velocity: 0.7
            }
            const gain = this.shapeVolume(note)
            this.instrument.play(note.name, now + index * 0.015, {
                duration: 1.8,
                gain
            })
            this.onNote(note, gain)
        })
    }

    midiToName(midi){
        const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
        return `${names[midi % 12]}${Math.floor(midi / 12) - 1}`
    }

    stop() {
        this.playing = false
        this.startedAt = null
        this.nextNoteIndex = 0
    }

    update(now) {
        if(!this.playing || !this.instrument) return

        const elapsed = (now - this.startedAt) / 1000
        const songDuration = this.notes[this.notes.length - 1].beat * this.secondsPerBeat + 2

        while(
            this.nextNoteIndex < this.notes.length &&
            this.notes[this.nextNoteIndex].beat * this.secondsPerBeat <= elapsed
        ) {
            const note = this.notes[this.nextNoteIndex]
            const gain = this.shapeVolume(note)

            this.instrument.play(note.name, this.audioContext.currentTime, {
                duration: note.duration,
                gain
            })
            this.onNote(note, gain)
            this.nextNoteIndex += 1
        }

        if(elapsed >= songDuration) this.stop()
    }

    shapeVolume(note) {
        const melodyBoost = note.name.endsWith("4") || note.name.endsWith("5") ? 1.15 : 1
        const bassCut = note.name.endsWith("1") || note.name.endsWith("2") ? 0.55 : 1
        const highSoftening = note.name.endsWith("6") || note.name.endsWith("7") ? 0.72 : 1
        return Math.min(1, note.velocity * melodyBoost * bassCut * highSoftening)
    }
}

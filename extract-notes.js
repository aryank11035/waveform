const fs = require("fs")

const inputPath = process.argv[2] || "song.mid"
const outputPath = process.argv[3] || "notes.js"
const data = fs.readFileSync(inputPath)
let offset = 0

function readString(length) {
    const value = data.toString("ascii", offset, offset + length)
    offset += length
    return value
}

function readUInt16() {
    const value = data.readUInt16BE(offset)
    offset += 2
    return value
}

function readUInt32() {
    const value = data.readUInt32BE(offset)
    offset += 4
    return value
}

function readVariableLength() {
    let value = 0
    let byte
    do {
        byte = data[offset++]
        value = (value << 7) | (byte & 0x7f)
    } while (byte & 0x80)
    return value
}

if (readString(4) !== "MThd") throw new Error("Invalid MIDI header")
const headerLength = readUInt32()
const format = readUInt16()
const trackCount = readUInt16()
const ticksPerBeat = readUInt16()
offset += headerLength - 6

const allNotes = []
let tempo = 500000
let maxTime = 0

for (let trackIndex = 0; trackIndex < trackCount; trackIndex++) {
    if (readString(4) !== "MTrk") throw new Error(`Invalid MIDI track ${trackIndex}`)
    const trackEnd = offset + readUInt32()
    let tick = 0
    let runningStatus = 0
    const activeNotes = new Map()

    while (offset < trackEnd) {
        tick += readVariableLength()
        let status = data[offset++]
        if (status < 0x80) {
            offset--
            status = runningStatus
        } else if (status < 0xf0) {
            runningStatus = status
        }

        if (status === 0xff) {
            const metaType = data[offset++]
            const length = readVariableLength()
            if (metaType === 0x51 && length === 3) tempo = data.readUIntBE(offset, 3)
            offset += length
            continue
        }
        if (status === 0xf0 || status === 0xf7) {
            offset += readVariableLength()
            continue
        }

        const command = status & 0xf0
        const noteNumber = data[offset++]
        const value = data[offset++]
        if (command === 0x90 && value > 0) {
            activeNotes.set(noteNumber, { tick, velocity: value / 127 })
        } else if (command === 0x80 || (command === 0x90 && value === 0)) {
            const start = activeNotes.get(noteNumber)
            if (start) {
                const startTime = start.tick * tempo / ticksPerBeat / 1000000
                const endTime = tick * tempo / ticksPerBeat / 1000000
                allNotes.push({
                    name: midiNoteName(noteNumber),
                    beat: start.tick / ticksPerBeat,
                    time: startTime,
                    duration: endTime - startTime,
                    velocity: start.velocity
                })
                maxTime = Math.max(maxTime, endTime)
                activeNotes.delete(noteNumber)
            }
        }
    }
    offset = trackEnd
}

allNotes.sort((a, b) => a.time - b.time)
const output = `export const notes = ${JSON.stringify(allNotes)}\nexport const duration = ${maxTime}\n`
fs.writeFileSync(outputPath, output)
console.log(`Extracted ${allNotes.length} notes to ${outputPath}`)

function midiNoteName(number) {
    const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    return `${names[number % 12]}${Math.floor(number / 12) - 1}`
}
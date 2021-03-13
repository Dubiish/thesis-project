const mongoose = require("mongoose")
const Schema = mongoose.Schema

const LampSchema = new Schema({
    token: {
        type: String,
        required: true
    },
    isOn: {
        type: Boolean,
        required: true,
        default: false
    },
    hue: {
        type: Number,
        default: 0
    },
    sat: {
        type: Number,
        default: 0
    },
    brightness: {
        type: Number,
        default: 0
    },
    timestamp: Number
}, {
    timestamps: true
})

const Lamps = mongoose.model("lamps", LampSchema)

module.exports = Lamps
const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ThermoSchema = new Schema({
    token: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        required: true,
        default: 0
    },
    timestamp: Number
}, {
    timestamps: true
})

const Thermometers = mongoose.model("thermometer", ThermoSchema)

module.exports = Thermometers
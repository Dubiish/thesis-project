const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ThermoSchema = new Schema({
    token: String,
    value: Number
}, {
    timestamps: true
})

const Thermometers = mongoose.model("thermometer", ThermoSchema)

module.exports = Thermometers
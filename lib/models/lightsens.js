const mongoose = require("mongoose")
const Schema = mongoose.Schema

const LightsensSchema = new Schema({
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

const Lightsenses = mongoose.model("lightsens", LightsensSchema)

module.exports = Lightsenses
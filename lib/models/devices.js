const mongoose = require("mongoose")
const Schema = mongoose.Schema

const DevicesSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    address: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["thermometer", "lightsens", "device"],
        default: "device",
        required: true
    },
    location: String,
    token: String,
    timestamp: Number
}, {
    timestamps: true
})

const Devices = mongoose.model("device", DevicesSchema)

module.exports = Devices
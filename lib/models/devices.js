const mongoose = require("mongoose")
const Schema = mongoose.Schema

const DevicesSchema = new Schema({
    name: String,
    description: String,
    address: String,
    type: String,
    location: String,
    token: String
}, {
    timestamps: true
})

const Devices = mongoose.model("device", DevicesSchema)

module.exports = Devices
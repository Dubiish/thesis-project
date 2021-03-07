const mongoose = require("mongoose")
const Schema = mongoose.Schema

const HumiditysensSchema = new Schema({
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

const Humiditysenses = mongoose.model("humiditysens", HumiditysensSchema)

module.exports = Humiditysenses
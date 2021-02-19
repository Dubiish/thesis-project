const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AvengersSchema = new Schema({
    name: String,
    weight: Number,
});

const Avengers = mongoose.model("avengers", AvengersSchema);

module.exports = Avengers;
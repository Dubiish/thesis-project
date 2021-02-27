const mongoose = require("mongoose")
const Schema = mongoose.Schema

class Database {

    constructor() {
        mongoose.connect("mongodb://localhost/bp", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        
        this.DevicesSchema = new Schema({
            name: String,
            description: String,
            address: String,
            type: String,
            location: String
        })

        this.Device = mongoose.model("device", this.DevicesSchema)

    }

    async addDevice(device) {
        
        var entry = new this.Device({
            ...device
        })

        return entry.save().then(result => {
            return true
        }).catch(err => {
            return false
        })
    }
    
    async getDevices(filter) {
        if(!filter) {
            return this.Device.find({}).then((devices) => {
                return devices
            })
        } else {
            return this.Device.find({...filter}).then((devices) => {
                return devices
            })
        }
    }
}

module.exports = Database
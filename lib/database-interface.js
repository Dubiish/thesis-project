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

    isIdValid(id) {
        return mongoose.isValidObjectId(id)
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

    async removeDevice(device_id) {
        if(!device_id) {
            return false
        }

        return this.Device.deleteOne({"_id": device_id}).then((result) => {
            if(result) {
                return true
            } else {
                return false
            }
        })
    }
}

module.exports = Database
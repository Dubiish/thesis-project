const mongoose = require("mongoose")

class Database {

    constructor() {
        mongoose.connect("mongodb://localhost/bp", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        this.Device = require("./models/devices")
        this.Thermometer = require("./models/thermometers")

    }

    isIdValid(id) {
        return id.length == 32
    }

    async addDevice(device) {
        
        var entry = new this.Device({
            ...device
        })

        return entry.save().then(result => {
            return true
        }).catch(err => {
            console.log("Error:", err)
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

    async removeDevice(token) {
        return this.Device.deleteOne({"token": token}).then((result) => {
            return result ? true : false
        })
    }

    async updateDevice(token, device_body) {
        return this.Device.updateOne({"token": token}, device_body).then(result => {
            if(result.nModified >= 1) {
                return this.getDevices({"token": token})
            } else {
                return false
            }
        })
    }

    async writeData(device_type, data) {
        if(device_type == "thermometer") {
            var entry = new this.Thermometer({
                ...data
            })
            return entry.save().then(result => {
                return true
            })
        } else {
            return false
        }
    }

    async readData(token, type) {
        if(type == "thermometer") {
            let data = await this.Thermometer.find({"token": token})

            if(!data) {
                return null
            }

            return data
        }
        return false
    }
}

module.exports = Database
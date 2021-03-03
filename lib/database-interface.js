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
        return id.len() == 16
    }

    async addDevice(device) {
        
        var entry = new this.Device({
            ...device
        })

        return entry.save().then(result => {
            console.log("Device added to database")
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
        if(!token) {
            return false
        }

        return this.Device.deleteOne({"token": token}).then((result) => {
            if(result) {
                return true
            } else {
                return false
            }
        })
    }

    async updateDevice(token, device_body) {
        return this.Device.updateOne({"token": token}, device_body).then(result => {
            if(result) {
                return true
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
            return this.Thermometer.find({"token": token}).then((data, err) => {
                if(err) {
                    console.log("Error", err)
                    return 500
                } else if(!data) {
                    return 204
                } else {
                    return data
                }
            })
        }
    }
}

module.exports = Database
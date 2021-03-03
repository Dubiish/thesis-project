const Database = require("./database-interface")
const crypto = require("crypto")

class DeviceRegister {
    
    constructor() {
        this.db = new Database()
    }

    async isDeviceRegistered(device) {
        return this.db.getDevices({...device}).then(response => {
            console.log(response)
            return response.length ? true : false
        })
    }

    async registerDevice(data) {
        return this.isDeviceRegistered(data).then((result) => {
            if(!result) {
                if(data.name && data.address && data.type) {
                    let token = crypto.randomBytes(16).toString("hex")
                    let device = {
                        "name": data.name,
                        "description": data.description ? data.description : null,
                        "address": data.address,
                        "type": data.type,
                        "location": data.location ? data.location : null,
                        "token": token
                    }
                    return this.db.addDevice(device).then((status) => {
                        return status ? token : 3
                    })
                } else {
                    return 2
                }
            } else {
                return 1
            }
        })
    }

    async getDevices(filter) {
        if(!filter) {
            return this.db.getDevices(null).then((devices) => {
                return devices ? devices : 1
            })
        } else {
            if(filter.token) {
                return this.db.getDevices(filter).then((devices) => {
                    return devices ? devices : 1
                })
            } else {
                return 2
            }
        }
    }

    async removeDevice(token) {
        return this.db.removeDevice(token).then((response) => {
            return response
        })
    }

    async updateDevice(token, updated_device) {
        if(this.db.isIdValid(token)) {
            return this.db.updateDevice(token, updated_device).then(response => {
                return response
            })
        } else {
            return false
        }
    }
}

module.exports = DeviceRegister
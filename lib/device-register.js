const Database = require("./database-interface")

class DeviceRegister {
    
    constructor() {
        this.db = new Database()
    }

    async registerDevice(data) {
        if(data.name && data.address && data.type) {
            let device = {
                "name": data.name,
                "description": data.description ? data.description : null,
                "address": data.address,
                "type": data.type,
                "location": data.location ? data.location : null
            }
            return this.db.addDevice(device).then((status) => {
                if(status) {
                    return device
                } else {
                    return status
                }
            })
        }
    }

    async getDevices(filter) {
        if(!filter) {
            return this.db.getDevices(null).then((devices) => {
                if(!devices) {
                    return false
                } else {
                    return devices
                }
            })
        } else {
            if(filter["_id"] && this.db.isIdValid(filter["_id"])) {
                return this.db.getDevices(filter).then((devices) => {
                    if(!devices) {
                        return false
                    } else {
                        return devices
                    }
                })
            } else {
                return false
            }
        }
    }

    async removeDevice(device_id) {
        return this.db.removeDevice(device_id).then((response) => {
            if(response) {
                return true
            } else {
                return false
            }
        })
    }
}

module.exports = DeviceRegister
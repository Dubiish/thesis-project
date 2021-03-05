const Database = require("./database-interface")
const crypto = require("crypto")

class DeviceRegister {
    
    constructor() {
        this.db = new Database()
    }

    async isDeviceRegistered(device) {
        let response = await this.db.getDevices({...device})
        return response.length ? true : false
    }

    async registerDevice(data) {
        let registered = await this.isDeviceRegistered(data)
        if(!registered) {
            if(data.name && data.address && data.type) {
                
                // Vygeneruje 32 znakovy unikatny identifikacny token
                let token = null
                do {
                    token = crypto.randomBytes(16).toString("hex")
                } while(await this.isDeviceRegistered(token))

                // Preparsuje data zo vstupu
                let device = {
                    "name": data.name,
                    "description": data.description ? data.description : null,
                    "address": data.address,
                    "type": data.type,
                    "location": data.location ? data.location : null,
                    "token": token
                }

                let result = await this.db.addDevice(device)
                return result ? token : 500
            
            } else {
                return 400
            }

        } else {
            return 403
        }
    }

    async getDevices(filter) {
        let devices = null
        if(!filter) {
            devices = await this.db.getDevices(null)
        } else {
            if(filter.token) {
                devices = await this.db.getDevices({"token": filter.token})
            } else {
                devices = await this.db.getDevices(filter)
            }
        }
        if(devices.length) {
            let stripedDevices = []
            for(const device of devices) {
                stripedDevices.push({
                    "name": device.name,
                    "description": device.description,
                    "address": device.address,
                    "type": device.type,
                    "location": device.location,
                    "token": device.token,
                    "createdAt": device.createdAt
                })
            }
            return stripedDevices
        } else {
            return []
        }
    }

    async removeDevice(token) {
        let device = await this.db.getDevices({"token": token})
        if(device.length) {
            let result = await this.db.removeDevice(token)
            return result ? 204 : 500
        } else {
            return 404
        }
    }

    async updateDevice(token, updatedDevice) {
        let device = await this.getDevices({"token": token})
            if(device.length) {
                let result = await this.db.updateDevice(token, updatedDevice)
                if(result) {
                    result = result[0]
                    let stripedDevice = {
                        "name": result.name,
                        "description": result.description,
                        "address": result.address,
                        "type": result.type,
                        "location": result.location,
                        "token": result.token,
                        "createdAt": result.createdAt
                    }
                    return stripedDevice
                } else {
                    return 500
                }
            } else {
                return 404
            }
    }
}

module.exports = DeviceRegister
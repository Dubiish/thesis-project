const Database = require("./database-interface")
const crypto = require("crypto")

class DeviceRegister {
    
    constructor() {
        this.db = new Database()
    }

    /**
    * Zistí či je dané zariadenie už registrované v databázy
    *
    * @param {object} device - Objekt zariadenia
    * @returns {boolean} Výsledok operácie
    */
    async isDeviceRegistered(device) {
        let response = await this.db.getSingleDevice({...device})
        return response ? true : false
    }

    /**
    * Zistí či je zariadenia daného typu
    *
    * @param {string} type - typ zariadenia
    * @param {string} deviceToken - identifikacny token zariadenia
    * @returns {boolean} Výsledok operácie
    */
    async isDeviceType(type, deviceToken) {
        let response = await this.db.getSingleDevice({"token": deviceToken})
        if(response && response.type == type) {
            return true
        } else {
            return false
        }
    }

    /**
    * Pridanie nového zariadenia
    *
    * @param {object} device - Objekt zariadenia
    * @returns {(object|number)} Objekt obsahujúci token zariadenia alebo status kód
    */
    async registerDevice(device) {

        let registered = await this.isDeviceRegistered(device)
        if(!registered) {

            if(device.name && device.address && device.type) {
                
                let token = null
                do {
                    token = crypto.randomBytes(16).toString("hex")
                } while(await this.isDeviceRegistered(token))

                let parsedDevice = {
                    "name": device.name,
                    "description": device.description ? device.description : null,
                    "address": device.address,
                    "type": device.type,
                    "location": device.location ? device.location : null,
                    "token": token,
                    "timestamp": Math.floor(Date.now() / 1000)
                }

                let result = await this.db.addDevice(parsedDevice)

                if(device.type == "lamp" && result) {
                    await this.db.insertNewLamp(token)
                }
                return result ? token : 500
            
            } else {
                return 400
            }

        } else {
            return 403
        }
    }

    /**
    * Získanie zoznamu zariadení
    *
    * @param {object} filter - Filter
    * @returns {(object|number)} Zoznam zariadení alebo status kód
    */
    async getDevices(filter) {
        let devices = []

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
                    "timestamp": device.timestamp
                })
            }

            return stripedDevices
        } else {
            return 204
        }
    }
    
    /**
    * Aktualizácia existujúceho zariadenia
    *
    * @param {string} token - Identifikačný token zariadenia
    * @param {object} updatedDevice - Nový objekt zariadenia
    * @returns {(object|number)} Aktualizované zariadenie alebo status kód
    */
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
                        "timestamp": result.timestamp
                    }
 
                    return stripedDevice
                } else {
                    return 500
                }
            } else {
                return 404
            }
    }
    
    /**
    * Odstránenie zariadenia
    *
    * @param {string} token - Identifikačný token zariadenia
    * @returns {number} Status kód
    */
    async removeDevice(token) {

        let device = await this.db.getDevices({"token": token})
        if(device.length) {

            let result = await this.db.removeDevice(token)
            return result ? 204 : 500

        } else {
            return 404
        }
    }

}

module.exports = DeviceRegister
const Database = require("./database-interface")
const crypto = require("crypto")

class DeviceRegister {
    
    constructor() {
        this.db = new Database()
    }

    /**
    * Zisti ci je zariadenie uz registrovane v databazi
    *
    * @param {object} device - filter/objekt zariadenia
    */
    async isDeviceRegistered(device) {
        let response = await this.db.getDevices({...device})
        return response.length ? true : false
    }

    /**
    * Pridanie noveho zariadenia
    *
    * @param {object} device - Objekt zariadenia
    */
    async registerDevice(device) {

        // Kontrola ci je zariadenie uz registrovane
        let registered = await this.isDeviceRegistered(device)
        if(!registered) {

            // Kontrola ci je su vsetky povinne polozky uvedene
            if(device.name && device.address && device.type) {
                
                // Vygeneruje 32 znakovy unikatny identifikacny token
                let token = null
                do {
                    token = crypto.randomBytes(16).toString("hex")
                } while(await this.isDeviceRegistered(token))

                // Preparsuje data zo vstupu do spravneho formatu zariadenia
                let parsedDevice = {
                    "name": device.name,
                    "description": device.description ? device.description : null,
                    "address": device.address,
                    "type": device.type,
                    "location": device.location ? device.location : null,
                    "token": token,
                    "timestamp": Math.floor(Date.now() / 1000)
                }

                // Preposle data databazovemu rozhraniu na zapis
                let result = await this.db.addDevice(parsedDevice)
                return result ? token : 500
            
            } else {
                return 400
            }

        } else {
            return 403
        }
    }

    /**
    * Ziskanie zoznamu zariadeni
    *
    * @param {object} filter - Filter
    */
    async getDevices(filter) {
        let devices = []

        // Kontrola a ziskanie dat podla roznych druhov filtrovania
        if(!filter) {
            devices = await this.db.getDevices(null)
        } else {
            if(filter.token) {
                devices = await this.db.getDevices({"token": filter.token})
            } else {
                devices = await this.db.getDevices(filter)
            }
        }

        // Odstranenie nepotrebnych udajov na vystupe
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
    * Odstranenie zariadenia
    *
    * @param {string} token - Identifikacny token zariadenia
    */
    async removeDevice(token) {

        // Kontrola ci zariadenie existuje
        let device = await this.db.getDevices({"token": token})
        if(device.length) {

            // Odstranenie zariadenia
            let result = await this.db.removeDevice(token)
            return result ? 204 : 500

        } else {
            return 404
        }
    }

    /**
    * Aktualizuje existujuce zariadenie
    *
    * @param {string} token - Identifikacny token zariadenia
    * @param {object} updatedDevice - Objekt novych udajov zariadenia
    */
    async updateDevice(token, updatedDevice) {

        // Kontrola ci dane zariadenie existuje
        let device = await this.getDevices({"token": token})
            if(device.length) {

                // Aktualizacia zariadenia
                let result = await this.db.updateDevice(token, updatedDevice)
                if(result) {

                    // Preparsovanie dat pred vystupom
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

                    // Vrati aktualizovane zariadenie
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
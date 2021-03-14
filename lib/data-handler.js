const Database = require("./database-interface")
const DeviceRegister = require("./device-register")

class DataHandler {

    constructor() {
        // Create connection to database via database interface module
        this.db = new Database()
        this.devReg = new DeviceRegister()
    }

    /**
    * Zmení state lampy
    *
    * @param {string} deviceToken - Token zariadenia
    */
    async updateLamp(deviceToken, data) {
        let isType = await this.devReg.isDeviceType("lamp", deviceToken)
        if(isType) {
            let result = await this.db.updateLamp(data, deviceToken)
            if(result) {
                let data = await this.db.getLampData(deviceToken)
                return data ? data : 500
            } else {
                return 500
            }
        }
    }

    /**
    * Získa dáta lampy
    *
    * @param {string} deviceToken - Token zariadenia
    */
    async getLamp(token) {
        if(await this.devReg.isDeviceType("lamp", token)) {
            let data = await this.db.getLampData(token)
            if(data) {
                let parsedData = {
                    "isOn": data.isOn,
                    "hue": data.hue,
                    "sat": data.sat,
                    "brightness": data.brightness,
                }
                return parsedData
            } else {
                return 500
            }
        } else {
            return 404
        }
    }

    /**
    * Zapis dat do konkretnych kolekcií databazy
    *
    * @param {string} device_token - Token zariadenia
    * @param {object} data - Data ktore budu zapisane
    */
    async postData(device_token, data) {

        // Ziskanie zariadenia
        let devices = await this.db.getDevices({"token": device_token})

        // Ak dane zariadenie existuje
        if(devices[0]) {

            let type = devices[0].type

            // Podla toho akeho je zariadenie typu, preparsuje data a zapise do databazy
            if(type == "thermometer" || type == "lightsens" || type == "humiditysens") {

                // Ak je obsah dat prazdny
                if(!data.value) {
                    return 400
                }

                // Parsovanie do spravneho formatu
                let parsedData = {
                    "token": device_token,
                    "value": data.value,
                    "timestamp": Math.floor(Date.now() / 1000)
                }

                // Zapis do databazy
                let result = await this.db.writeData(type, parsedData)
                return result ? parsedData : 500

            } else {
                return 400
            }

        } else {
            return 404
        }
    }

    /**
    * Citanie dat z databazy na zaklade tokenu zariadenia
    *
    * @param {string} device_token - token zariadenia
    */
    async getDataByToken(device_token, filter) {

        let dateFilter = null
        if(filter.startDate || filter.endDate) {
            dateFilter = {
                "start": filter.startDate ? Number(filter.startDate) : 0,
                "end": filter.endDate ? Number(filter.endDate) : Number.MAX_SAFE_INTEGER
            }
        }

        // Ziskaj zoznam zariadeni
        let devices = await this.db.getDevices({"token": device_token})

        // Zisti ci je v zozname nejaka polozka
        if(devices.length) {

            let device = devices[0]

            let stripedDevice = {
                "name": device.name,
                "description": device.description,
                "address": device.address,
                "type": device.type,
                "location": device.location,
                "token": device.token,
                "timestamp": device.timestamp
            }

            // Ziskaj data zariadenia
            let data = await this.db.readData(device_token, device.type, dateFilter)

            // Ziadne data nie su k dispozicii
            if(data) {
                // Odstran z dat nepotrebne udaje
                let parsedData = []
                data.forEach(element => {
                    parsedData.push({
                        "id":  element._id,
                        "value": element.value,
                        "timestamp": element.timestamp
                    })
                });
    
                return {
                    "device": stripedDevice,
                    "data": parsedData
                }
            } else {
                return 204
            }


        } else {
            return 404 // Ziadne zariadenie nevyhovuje filtru
        }
    }

    /**
    * Citanie dat z databazy na zaklade filtra
    *
    * @param {object} filter - filter
    */
    async getDataByFilter(filter) {

        // Nacita filter datumov do lokalnej premennej a odstrani ho z filtru
        let dateFilter = null
        if(filter.startDate || filter.endDate) {

            dateFilter = {
                "start": filter.startDate ? Number(filter.startDate) : 0,
                "end": filter.endDate ? Number(filter.endDate) : Number.MAX_SAFE_INTEGER
            }

            delete filter.startDate
            delete filter.endDate
        }

        if(!filter.type) {
            return 400
        }

        // Ziskaj zoznam vsetky zariadeni zodpovedajucich filtru
        let devices = await this.db.getDevices({...filter})

        // Ak sa v odpovedi nachadza aspon jedno zariadenie
        if(devices.length) {

            var response = []

            // Prechadzaj zoznam zariadeni
            for(const device of devices) {

                // Odstran vsetky nepotrebne udaje zo zariadenia
                let stripedDevice = {
                    "name": device.name,
                    "description": device.description,
                    "address": device.address,
                    "type": device.type,
                    "location": device.location,
                    "token": device.token,
                    "timestamp": device.timestamp
                }

                // Ziskaj data zariadenia podla tokenu a typu
                const data = await this.db.readData(device.token, device.type, dateFilter)

                if(data) {
                    // Z dat odstran nepotrebne udaje
                    let stripedData = []
                    for(const record of data) {
                        stripedData.push({
                            "id": record._id,
                            "value": record.value,
                            "timestamp": record.timestamp
                        })
                    }
                    
                    response.push({
                        "device": stripedDevice,
                        "data": stripedData
                    })
                } else {
                    continue   
                }

            }

            if(response.length) {
                return response
            } else {
                return 204
            }

        } else {
            return 404 // Žiadne zariadenie neexistuje
        }
    }

    async getSingleRecord(token, id) {
        let devices = await this.db.getDevices({"token": token})
        if(!devices) {
            return 404
        }

        let result = await this.db.getDataById(id, devices[0].type)
        let parsedResult = {
            "id": id,
            "value": result.value,
            "timestamp": result.timestamp
        }

        return result ? parsedResult : 404
    }

    async updateData(data, token, id) {
        if(!data.value) {
            return 400
        }

        let devices = await this.db.getDevices({"token": token})
        if(!devices) {
            return 404
        }

        let parsedData = {}
        if(data.value) {
            parsedData.value = data.value
        } else if(data.timestamp) {
            parsedData.timestamp = data.timestamp
        }

        let result = await this.db.updateData({"token": token, "id": id, "type": devices[0].type}, parsedData)
        return result ? 204 : 500
    }

    async deleteData(filter, token) {
        
        let dateFilter = {
            "start": filter.startDate ? Number(filter.startDate) : 0,
            "end": filter.endDate ? Number(filter.endDate) : Number.MAX_SAFE_INTEGER
        }

        let devices = await this.db.getDevices({"token": token})
        if(!devices.length) {
            return 404
        }

        let result = null
        if(filter.id) {
            result = await this.db.deleteData({"id": filter.id, "token": token}, devices[0].type, dateFilter)
        } else {
            result = await this.db.deleteData({"token": token}, devices[0].type, dateFilter)
        }
        return result ? 204 : 500
    }
}

module.exports = DataHandler
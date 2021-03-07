const Database = require("./database-interface")

class DataHandler {

    constructor() {
        // Create connection to database via database interface module
        this.db = new Database()
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
                return result ? 204 : 500

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
}

module.exports = DataHandler
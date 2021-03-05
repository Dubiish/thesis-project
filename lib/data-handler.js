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

        return this.db.getDevices({"token": device_token}).then(response => {
            if(response[0]) {
                if(response[0].type == "thermometer") {

                    if(!data.value) {
                        return 400
                    }

                    let parsed_data = {
                        "token": device_token,
                        "value": data.value,
                    }
                    return this.db.writeData("thermometer", parsed_data).then(result => {
                        return result ? 204 : 500
                    })
                } else {
                    return 400
                }
            } else {
                return 404
            }
        })
    }

    /**
    * Citanie dat z databazy na zaklade tokenu zariadenia
    *
    * @param {string} device_token - token zariadenia
    */
    async getDataByToken(device_token) {

        // Ziskaj zoznam zariadeni
        let devices = await this.db.getDevices({"token": device_token})

        // Zisti ci je v zozname nejaka polozka
        if(devices.length) {

            let device = devices[0]

            // Ziskaj data zariadenia
            let data = await this.db.readData(device_token, device.type)

            // Ziadne data nie su k dispozicii
            if(data == null) {
                return {
                    device,
                    "data": null
                }
            }

            // Odstran z dat nepotrebne udaje
            let parsedData = []
            data.forEach(element => {
                parsedData.push({
                    "value": element.value,
                    "createdAt": element.createdAt
                })
            });

            return {
                device,
                "data": parsedData
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
                    "createdAt": device.createdAt
                }

                // Ziskaj data zariadenia podla tokenu a typu
                const data = await this.db.readData(device.token, device.type)

                // Z dat odstran nepotrebne udaje
                let stripedData = []
                for(const record of data) {
                    stripedData.push({
                        "value": record.value,
                        "createdAt": record.createdAt
                    })
                }
                
                response.push({
                    "device": stripedDevice,
                    "data": stripedData
                })
            }

            return response

        } else {
            return 404 // Žiadne zariadenie neexistuje
        }
    }
}

module.exports = DataHandler
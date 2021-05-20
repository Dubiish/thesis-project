const Database = require("./database-interface")
const DeviceRegister = require("./device-register")

class DataHandler {

    constructor() {
        this.db = new Database()
        this.devReg = new DeviceRegister()
    }

    /**
    * Aktualizácia stavu lampy
    *
    * @param {string} deviceToken - Token zariadenia
    * @param {object} data - Nový stav lampy
    * @returns {(object|number)} Aktualizovaný objekt lampty alebo status kód
    */
    async updateLamp(deviceToken, data) {
        
        let isType = await this.devReg.isDeviceType("lamp", deviceToken)
        
        if(isType) {
            
            let result = await this.db.updateLamp(data, deviceToken)
            
            if(result) {
                
                let data = await this.db.getLampData(deviceToken)
                let parsedData = {
                    "isOn": data.isOn,
                    "hue": data.hue,
                    "sat": data.sat,
                    "brightness": data.brightness
                
                }
                return data ? parsedData : 500
            
            } else {
                return 500
            }
        
        } else {
            return 404
        }
    }

    /**
    * Získanie aktuálneho stavu lampy
    *
    * @param {string} deviceToken - Token zariadenia
    * @returns {(object | number)} Stav lampy alebo status kód
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
    * Zápis dát do konkretných kolekcií databázy
    *
    * @param {string} device_token - Token zariadenia
    * @param {object} data - Dáta ktore budu zapisane
    * @returns {(object|number)} Vytvorený objekt alebo status kód
    */
    async postData(device_token, data) {

        let devices = await this.db.getDevices({"token": device_token})

        if(devices[0]) {

            let type = devices[0].type

            if(type == "thermometer" || type == "lightsens" || type == "humiditysens") {

                if(!data.value) {
                    return 400
                }

                let parsedData = {
                    "token": device_token,
                    "value": data.value,
                    "timestamp": Math.floor(Date.now() / 1000)
                }

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
    * @param {object} filter - Voliteľný filter
    * @returns {(object|number)} Objekt dát alebo status kód
    */
    async getDataByToken(device_token, filter) {

        let dateFilter = null
        if(filter.startDate || filter.endDate) {
            dateFilter = {
                "start": filter.startDate ? Number(filter.startDate) : 0,
                "end": filter.endDate ? Number(filter.endDate) : Number.MAX_SAFE_INTEGER
            }
        }

        let devices = await this.db.getDevices({"token": device_token})

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

            let data = await this.db.readData(device_token, device.type, dateFilter)

            if(data) {
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
            return 404
        }
    }

    /**
    * Citanie dat z databazy na zaklade filtra
    *
    * @param {object} filter - Filter dát
    * @returns {(object|number)} Objekt dát alebo status kód
    */
    async getDataByFilter(filter) {

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

        let devices = await this.db.getDevices({...filter})

        if(devices.length) {

            var response = []

            for(const device of devices) {

                let stripedDevice = {
                    "name": device.name,
                    "description": device.description,
                    "address": device.address,
                    "type": device.type,
                    "location": device.location,
                    "token": device.token,
                    "timestamp": device.timestamp
                }

                const data = await this.db.readData(device.token, device.type, dateFilter)

                if(data) {
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
            return 404
        }
    }

    /**
    * Získanie jedného záznamu na základe ID
    *
    * @param {number} token - Identifikačný token zariadenia
    * @param {number} id - ID záznamu
    * @returns {(object|number)} Objekt dát alebo statu skód
    */
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

    /**
    * Aktualizácia konkretného záznamu dát
    *
    * @param {object} data - Nové hodnoty záznamu
    * @param {number} token - Identifikačný token zariadenia
    * @param {number} id - ID záznamu
    * @returns {number} Status kód
    */
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

    /**
    * Odstránenie záznamov dát
    *
    * @param {object} filter - Filter záznamov
    * @param {number} token - Identifikačný token zariadenia
    * @returns {number} Status kód
    */
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
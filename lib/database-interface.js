const mongoose = require("mongoose")

class Database {

    constructor() {

        mongoose.connect("mongodb://localhost/bp", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        this.Device = require("./models/devices")
        this.Thermometer = require("./models/thermometers")
        this.Lightsens = require("./models/lightsens")
        this.Humiditysens = require("./models/humiditysens")
        this.Lamp = require("./models/lamps")

    }

    /**
    * Skontroluje či je token v správnom formáte
    *
    * @param {string} id - Identifikačný token zariadenia
    * @returns {boolean} Výsledok kontroly
    */
    isIdValid(id) {
        return id.length == 32
    }

    /**
    * Táto funkcia vráti referenciu na model na základe vstupného stringu typu zariadenia
    *
    * @param {string} type - typ zariadenia
    * @returns {(mongoose.Model|boolean)} Model zodpovedajúci zariadeniu alebo false
    */
    getDeviceType(type) {
        let deviceType = null
        switch(type) {
            case "thermometer":
                deviceType = this.Thermometer
                break;
            case "lightsens":
                deviceType = this.Lightsens
                break;
            case "humiditysens":
                deviceType = this.Humiditysens
                break;
            case "lamp":
                deviceType = this.Lamp
                break;
            default:
                return false;
        }
        return deviceType
    }

    /**
    * Vytvorenie nového záznamu zariadenia v databáze
    *
    * @param {object} device - Objekt zariadenia
    * @returns {boolean} Výsledok operácie
    */
    async addDevice(device) {
        
        var entry = new this.Device({
            ...device
        })

        let result = await entry.save()
        return result ? true : false
    }

    /**
    * Získanie konkrétneho záznamu zariadenia
    *
    * @param {object} filter - Filter podla ktoreho bude vratene zariadenie z databazy
    * @returns {(object|boolean)} Záznam zariadenia alebo false
    */
    async getSingleDevice(filter) {
        if(!filter) {
            return false
        } else {
            let device = await this.Device.find({...filter})
            if(device) {
                return device[0]
            } else {
                return false
            }
        }
    }
    
    /**
    * Získanie zoznamu zariadení vyhovujich filtru
    *
    * @param {object} filter - Voliteľný filter
    * @returns {object} Zoznam zariadení
    */
    async getDevices(filter) {
        let devices = null
        if(!filter) {
            devices = await this.Device.find({})
        } else {
            devices = await this.Device.find({...filter})
        }
        return devices
    }

    /**
    * Odstránenie záznamu zariadenia z databázy
    *
    * @param {string} token - Identifikačný token zariadenia
    * @returns {boolean} Výsledok operácie
    */
    async removeDevice(token) {
        let result = await this.Device.deleteOne({"token": token})
        return result ? true : false
    }

    /**
    * Aktualizácia záznamu zariadenia
    *
    * @param {string} token - Identifikačný token zariadenia
    * @param {object} deviceBody - Objekt s aktualizovanými dátami
    * @returns {(object|boolean)} Aktualizovaný objekt alebo false
    * 
    */
    async updateDevice(token, deviceBody) {
        let updateResult = await this.Device.updateOne({"token": token}, deviceBody)

        if(updateResult.nModified >= 1) {

            let device = await this.getDevices({"token": token})
            return device

        } else {
            return false
        }
    }

    /**
    * Zapíše záznam dát do databázy
    *
    * @param {string} type - Typ zariadenia
    * @param {object} data - Dáta ktoré budú zapísané do databázy
    * @returns {boolean} Výsledok operácie
    */
    async writeData(type, data) {

        let entry = null

        let deviceType = this.getDeviceType(type)
        if(deviceType) {
            entry = new deviceType({
                ...data
            })
        } else {
            return false
        }

        let result = await entry.save()
        return result ? true : false
    }

    /**
    * Získanie dát z databázy konkrétného zariadenia
    *
    * @param {string} token - Identifikačný token zariadenia
    * @param {string} type - Typ zariadenia
    * @param {object} dateFilter - Filter
    * @returns {(object|boolean)} Objekt dát alebo false
    */
    async readData(token, type, dateFilter) {

        let data = null
        let deviceType = this.getDeviceType(type)
        
        if(!dateFilter) {

            if(deviceType) {
                data = await deviceType.find({"token": token})
            } else {
                return false
            }
            
        } else {

            if(deviceType) {
                data = await deviceType.find({
                    "token": token,
                }).where("timestamp").gt(dateFilter.start - 1).lt(dateFilter.end + 1)
            } else {
                return false
            }
        }

        if(data.length) {
            return data
        } else {
            return false
        }
        
    }

    /**
    * Získanie konkrétneho záznamu dát na základe ID
    *
    * @param {number} id - ID záznamu
    * @param {string} type - Typ zariadenia
    * @returns {(object|boolean)} Objekt dát alebo false
    */
    async getDataById(id, type) {
        let deviceType = this.getDeviceType(type)
        if(deviceType) {
            let result = await deviceType.findById(id)
            if(result) {
                return result
            } else {
                return false
            }
        } else {
            return false
        }
    }

    /**
    * Aktualizácia záznamu dát
    *
    * @param {object} filter - Filter
    * @param {object} data - Nový objekt dát
    * @returns {boolean} Výsledok operácie
    */
    async updateData(filter, data) {
        let deviceType = this.getDeviceType(filter.type)
        if(deviceType) {
            let result = await deviceType.updateOne({"token": filter.token, "_id": filter.id}, data)
            return result ? true : false
        } else {
            return false
        }
    }

    /**
    * Odstránenie dát z databázy
    *
    * @param {object} filter - Identifikačný token zariadenia
    * @param {string} type - Typ zariadenia
    * @param {object} dateFilter - Filter
    * @returns {boolean} Výsledok operácie
    */
    async deleteData(filter, type, dateFilter) {
        let deviceType = this.getDeviceType(type)
        if(deviceType) {
            let result = null
            if(filter.id) {
                result = await deviceType.deleteOne({"token": filter.token, "_id": filter.id})
            } else {
                result = await deviceType.deleteMany({"token": filter.token}).where("timestamp").gt(dateFilter.start - 1).lt(dateFilter.end + 1)
            }
            return result ? true : false
        } else {
            return false
        }
    }

    /**
    * Získanie stavu lampy z databázy
    *
    * @param {string} token - Identifikačný token zariadenia
    * @returns {(object|boolean)} Objekt dát alebo false
    */
    async getLampData(token) {
        if(token) {
            let result = await this.Lamp.findOne({"token": token})
            return result ? result : false
        } else {
            return false
        }
    }

    /**
    * Aktualizácia stavu lampy v databáze
    *
    * @param {string} token - Identifikačný token zariadenia
    * @param {object} data - Nový objekt lampy
    * @returns {boolean} Výsledok operáice
    */
    async updateLamp(data, token) {
        if(data && token) {
            let result = await this.Lamp.updateOne({"token": token}, {...data})
            return result ? true : false
        } else {
            return false
        }
    }

    /**
    * Pridanie novej lampy do databázy
    *
    * @param {string} token - Identifikačný token zariadenia
    * @returns {boolean} Výsledok operáice
    */
    async insertNewLamp(token) {
        let entry = new this.Lamp({
            "token": token
        })

        let result = await entry.save()
        return result ? true : false
    }
}

module.exports = Database
const mongoose = require("mongoose")

class Database {

    constructor() {

        // Pripojenie k databaze
        mongoose.connect("mongodb://localhost/bp", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        // Nacitanie modelov
        this.Device = require("./models/devices")
        this.Thermometer = require("./models/thermometers")
        this.Lightsens = require("./models/lightsens")
        this.Humiditysens = require("./models/humiditysens")
        this.Lamp = require("./models/lamps")

    }

    /**
    * Skontroluje ci je format tokenu validny
    *
    * @param {string} id - Identifikacny token zariadenia
    */
    isIdValid(id) {
        // Pozn. v tejto funkcii je mozne doplnit aj podrobnejsiu kontrolu napriklad ci dany token zodpoveda nejakemu zariadeniu
        return id.length == 32
    }

    /**
    * Tato funkcia vráti referenciu na model na zaklade vstupneho stringu typu zariadenia
    *
    * @param {string} type - typ zariadenia
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
    * Pridanie zariadenia do databazy
    *
    * @param {object} device - Objekt zariadenia
    */
    async addDevice(device) {
        
        // Vytvorenie noveho zaznamu
        var entry = new this.Device({
            ...device
        })

        // Ulozenie zaznamu do databazy
        let result = await entry.save()
        return result ? true : false
    }

    /**
    * Ziskanie konkrétneho zariadenia
    *
    * @param {object} filter - Filter podla ktoreho bude vratene zariadenie z databazy
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
    * Ziskanie zoznamu zariadeni
    *
    * @param {object} filter - Filter podla ktoreho bude vratene zaznamy z databazy
    */
    async getDevices(filter) {
        let devices = null
        if(!filter) {
            // Ziskanie zoznamu zariadeni bez filtra
            devices = await this.Device.find({})
        } else {
            // Ziskanie zoznamu zariadenia s filtrom
            devices = await this.Device.find({...filter})
        }
        return devices
    }

    /**
    * Odstrani zariadenie z databazy
    *
    * @param {string} token - Identifikacny token zariadenie
    */
    async removeDevice(token) {
        // Zmazanie zariadenia z databazy podla tokenu
        let result = await this.Device.deleteOne({"token": token})
        return result ? true : false
    }

    /**
    * Aktualizuje udaje o zariadeni
    *
    * @param {string} token - Identifikacny token zariadenia
    * @param {object} deviceBody - Objekt obsahujuci udaje ktore budu zmenene
    */
    async updateDevice(token, deviceBody) {
        // Aktualizacia zaznamu v databaze
        let updateResult = await this.Device.updateOne({"token": token}, deviceBody)

        // Ak prebehla aktualizacia aspon jedneho zaznamu
        if(updateResult.nModified >= 1) {

            // Ziska a vrati aktualizovane zariadenie
            let device = await this.getDevices({"token": token})
            return device

        } else {
            return false
        }
    }

    /**
    * Aktualizuje udaje o zariadeni
    *
    * @param {string} deviceType - Druh zariadenia
    * @param {object} data - Data ktore budu zapisane do databazy
    */
    async writeData(type, data) {

        let entry = null

        let deviceType = this.getDeviceType(type)
        if(deviceType) {
            // Vytvorenie noveho zaznamu
            entry = new deviceType({
                ...data
            })
        } else {
            return false
        }

        // Ulozenie do databazy
        let result = await entry.save()
        return result ? true : false
    }

    /**
    * Ziska data na zaklade zariadenia
    *
    * @param {string} token - Identifikacny token zariadenia
    * @param {string} type - Typ zariadenia
    * @param {object} dateFilter - UNIX TIMESTAMP, Datumovy filter sluziaci na upresnenie casu a datumu
    */
    async readData(token, type, dateFilter) {

        let data = null
        let deviceType = this.getDeviceType(type)
        
        // Ziska zoznam dat zodpovedajucich zariadeniu s danym tokenom
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

        // kontrola existencie dat
        if(data.length) {
            return data
        } else {
            return false
        }
        
    }

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

    async updateData(filter, data) {
        let deviceType = this.getDeviceType(filter.type)
        if(deviceType) {
            let result = await deviceType.updateOne({"token": filter.token, "_id": filter.id}, data)
            return result ? true : false
        } else {
            return false
        }
    }

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

    async getLampData(token) {
        if(token) {
            let result = await this.Lamp.findOne({"token": token})
            return result ? result : false
        } else {
            return false
        }
    }

    async updateLamp(data, token) {
        if(data && token) {
            let result = await this.Lamp.updateOne({"token": token}, {...data})
            return result ? true : false
        } else {
            return false
        }
    }

    async insertNewLamp(token) {
        let entry = new this.Lamp({
            "token": token
        })

        let result = await entry.save()
        return result ? true : false
    }
}

module.exports = Database
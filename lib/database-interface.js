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
    async writeData(deviceType, data) {

        if(deviceType == "thermometer") {

            // Vytvorenie noveho zaznamu teplomera
            var entry = new this.Thermometer({
                ...data
            })

            // Ulozenie do databazy
            let result = await entry.save()
            return result ? true : false

        } else {
            return false
        }
    }

    /**
    * Ziska data na zaklade zariadenia
    *
    * @param {string} token - Identifikacny token zariadenia
    * @param {string} type - Typ zariadenia
    */
    async readData(token, type, dateFilter) {

        if(type == "thermometer") {

            // Ziska zoznam dat zodpovedajucich zariadeniu s danym tokenom
            let data = null
            if(!dateFilter) {
                data = await this.Thermometer.find({"token": token})
            } else {
                data = await this.Thermometer.find({
                    "token": token,
                }).where("timestamp").gt(dateFilter.start - 1).lt(dateFilter.end + 1)
            }

            // Ak neexistuje ziadne data
            if(data.length) {
                return data
            }
            
            return false
        }
        return false
    }
}

module.exports = Database
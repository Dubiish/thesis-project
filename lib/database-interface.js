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

        let entry = null

        if(deviceType == "thermometer") {
            // Vytvorenie noveho zaznamu teplomera
            entry = new this.Thermometer({
                ...data
            })
        } else if(deviceType == "lightsens") {
            // Vytvorenie noveho zaznamu teplomera
            entry = new this.Lightsens({
                ...data
            })
        } else if(deviceType == "humiditysens") {
            // Vytvorenie noveho zaznamu teplomera
            entry = new this.Humiditysens({
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
        
        // Ziska zoznam dat zodpovedajucich zariadeniu s danym tokenom
        if(!dateFilter) {

            // Teplomer
            if(type == "thermometer") {
                data = await this.Thermometer.find({"token": token})

            // Svetelny senzor
            } else if(type == "lightsens") {
                data = await this.Lightsens.find({"token": token})

            // Senzor vlhkosti
            } else {
                data = await this.Humiditysens.find({"token": token})
            }
            
        } else {

            // Teplomer
            if(type == "thermometer") {
                data = await this.Thermometer.find({
                    "token": token,
                }).where("timestamp").gt(dateFilter.start - 1).lt(dateFilter.end + 1)

            // Svetelny senzor
            } else if(type == "lightsens") {
                data = await this.Lightsens.find({
                    "token": token,
                }).where("timestamp").gt(dateFilter.start - 1).lt(dateFilter.end + 1)

            // Senzor vlhkosti
            } else {
                data = await this.Humiditysens.find({
                    "token": token,
                }).where("timestamp").gt(dateFilter.start - 1).lt(dateFilter.end + 1)
            }
        }

        // kontrola existencie dat
        if(data.length) {
            return data
        } else {
            return false
        }
        
    }
}

module.exports = Database
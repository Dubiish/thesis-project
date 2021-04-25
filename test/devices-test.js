const assert = require("assert")
const axios = require("axios")
const mongoose = require("mongoose")

const server = "http://localhost:3000"
const mongoServer = "mongodb://localhost/bp"

describe("Pridanie noveho zariadenia", () => {

    before((done) => {
        mongoose.connect(mongoServer, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, function(){
            mongoose.connection.db.dropDatabase(function(){
                done()
            })    
        })
    })

    after((done) => {
        mongoose.connection.close().then(() => {
            done()
        })
    })

    it("V spravnom formate", () => {
        return axios.post(server+"/devices", {
            "name": "Thermometer01",
            "description": "Testovaci teplomer",
            "address": "192.168.1.2",
            "location": "bedroom",
            "type": "thermometer"
        }).then(res => {
            assert(res.status === 201)
            assert(res.data.status === "OK")
            assert(res.data.token)
        }).catch(() => {
            throw Error
        })
    })

    it("Zariadenia typu lampa", () => {
        return axios.post(server+"/devices", {
            "name": "Lamp01",
            "description": "Testovacia lampa",
            "address": "192.168.1.4",
            "location": "kitchen",
            "type": "lamp"
        }).then(res => {
            assert(res.status === 201)
            assert(res.data.status === "OK")
            assert(res.data.token)
        }).catch(() => {
            throw Error
        })
    })

    it("S chybajucou povinnou polozkou v tele",  () => {
        return axios.post(server+"/devices", {
            "name": "Thermometer02",
            "address": "192.168.1.3",
            "location": "bedroom"
        }).then(() => {
            throw Error
        }).catch(error => {
            assert(error.response.data.status === "Failed")
            assert(error.response.status === 400)
        })
    })

    it("Uz existujuce zariadenie",  () => {
        return axios.post(server+"/devices", {
            "name": "Thermometer01",
            "description": "Testovaci teplomer",
            "address": "192.168.1.2",
            "location": "bedroom",
            "type": "thermometer"
        }).then(() => {
            throw Error
        }).catch(error => {
            assert(error.response.data.status === "Failed")
            assert(error.response.status === 403)
        })
    })
})

describe("Ziskanie informacii o zariadeni", () => {
    before((done) => {
        mongoose.connect(mongoServer, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, function(){
            mongoose.connection.db.dropDatabase(function(){
                done()
            })    
        })
    })

    after((done) => {
        mongoose.connection.close().then(() => {
            done()
        })
    })

    it("Vytvorenie testovacich zariadeni", async () => {
        return Promise.all([axios.post(server+"/devices", {
            "name": "Thermometer01",
            "description": "Testovaci teplomer",
            "address": "192.168.1.2",
            "location": "bedroom",
            "type": "thermometer"
        }), axios.post(server+"/devices", {
            "name": "Thermometer02",
            "description": "Testovaci teplomer",
            "address": "192.168.1.3",
            "location": "bedroom",
            "type": "thermometer"
        }), axios.post(server+"/devices", {
            "name": "Thermometer03",
            "description": "Testovaci teplomer",
            "address": "192.168.1.4",
            "location": "kitchen",
            "type": "thermometer"
        }), axios.post(server+"/devices", {
            "name": "LightSensor01",
            "description": "Testovaci svetelny senzor",
            "address": "192.168.1.8",
            "location": "bedroom",
            "type": "lightsens"
        }), axios.post(server+"/devices", {
            "name": "HumditySensor01",
            "description": "Testovaci senzor vlhkosti",
            "address": "192.168.2.3",
            "location": "garden",
            "type": "humiditysens"
        }), axios.post(server+"/devices", {
            "name": "Lamp01",
            "description": "Testovaca lampa",
            "address": "192.168.2.4",
            "location": "garden",
            "type": "lamp"
        })])
    })

    it("Existujuce zariadenie - filter tokenom", () => {
        return axios.post(server+"/devices", {
            "name": "Thermometer05",
            "description": "Testovaci teplomer",
            "address": "192.168.1.9",
            "location": "kitchen",
            "type": "thermometer"
        }).then(response => {
            if(response.status === 201) {
                return axios.get(`http://localhost:3000/devices?token=${response.data.token}`).then(res => {
                    assert(res.status === 200)
                    assert(res.data.devices.length === 1)
                }).catch(() => {
                    throw Error
                })
            } else {
                assert(false)
            }
        }).catch(() => {
            throw Error
        })
    })

    it("Existujuce zariadenie - filter dopytom", () => {
        return axios.get(server+"/devices?type=thermometer&location=kitchen").then(res => {
            assert(res.status === 200)
            assert(res.data.status === "OK")
            assert(res.data.devices.length > 0)
        }).catch(() => {
            throw Error
        })
    })

    it("Zoznam vsetkych zariadeni - bez filtra", () => {
        return axios.get(server+"/devices").then(res => {
            assert(res.status === 200)
            assert(res.data.status === "OK")
            assert(res.data.devices.length > 0)
        }).catch(() => {
            throw Error
        })
    })

    it("Neexistujuce zariadenie - filter tokenom", () => {
        return axios.get(`http://localhost:3000/devices?token=neexistujuciToken`).then(res => {
            assert(res.status === 200)
            assert(res.data.status === "OK")
            assert(res.data.devices.length === 0)
        }).catch(() => {
            throw Error
        })
    })

    it("Konkretne zariadenia - teplomer", () => {
        return axios.get(server+"/devices/thermometers").then(res => {
            assert(res.status === 200)
            assert(res.data.status === "OK")
            assert(res.data.devices.length > 0)
        }).catch(() => {
            throw Error
        })
    })

    it("Konkretne zariadenia - svetelny senzor", () => {
        return axios.get(server+"/devices/lightsensors").then(res => {
            assert(res.status === 200)
            assert(res.data.status === "OK")
            assert(res.data.devices.length > 0)
        }).catch(() => {
            throw Error
        })
    })

    it("Konkretne zariadenia - senzor vlhkosti", () => {
        return axios.get(server+"/devices/humiditysensors").then(res => {
            assert(res.status === 200)
            assert(res.data.status === "OK")
            assert(res.data.devices.length > 0)
        }).catch(() => {
            throw Error
        })
    })

    it("Konkretne zariadenia - lampa", () => {
        return axios.get(server+"/devices/lamps").then(res => {
            assert(res.status === 200)
            assert(res.data.status === "OK")
            assert(res.data.devices.length > 0)
        }).catch(() => {
            throw Error
        })
    })
})

describe("Úprava zariadenia", () => {
    before((done) => {
        mongoose.connect(mongoServer, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, function(){
            mongoose.connection.db.dropDatabase(function(){
                done()
            })    
        })
    })

    after((done) => {
        mongoose.connection.close().then(() => {
            done()
        })
    })

    it("Uprava parametrov existujuceho zariadenia", () => {
        return axios.post(server+"/devices", {
            "name": "Thermometer01",
            "description": "Testovaci teplomer",
            "address": "192.168.1.2",
            "location": "bedroom",
            "type": "thermometer"
        }).then(res => {
            return axios.put(server+"/devices", {
                "token": res.data.token,
                "name": "NewLightSensor01",
                "location": "kitchen",
                "type": "lightsens",
                "description": "Testovaci senzor svetla"
            }).then(response => {
                assert(response.status === 200)
                assert(response.data.status === "OK")
                assert(Object.keys(response.data.device).length > 0)
            }).catch(() => {
                throw Error
            })
        }).catch(() => {
            throw Error
        })
    })

    it("Uprava parametrov neexistujuceho zariadenia", () => {
        return axios.put(server+"/devices", {
            "token": "neexistujuciToken",
            "name": "NewDevice01"
        }).then(() => {
            throw Error
        }).catch(error => {
            assert(error.response.data.status === "Failed")
            assert(error.response.status === 404)
        })
    })
})

describe("Odstranenie zariadena", () => {
    before((done) => {
        mongoose.connect(mongoServer, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, function(){
            mongoose.connection.db.dropDatabase(function(){
                done()
            })    
        })
    })

    after((done) => {
        mongoose.connection.close().then(() => {
            done()
        })
    })

    it("Odstranenie existujuceho zariadenia", () => {
        return axios.post(server+"/devices", {
            "name": "Thermometer01",
            "description": "Testovaci teplomer",
            "address": "192.168.1.2",
            "location": "bedroom",
            "type": "thermometer"
        }).then(res => {
            return axios.delete(server+"/devices", {
                "data": {
                    "token": res.data.token
                }
            }).then(response => {
                assert(response.status === 200)
                assert(response.data.status === "OK")
            }).catch(() => {
                throw Error
            })
        })
    })

    it("Odstranenie neexistujuceho zariadenia", () => {
        return axios.delete(server+"/devices", {
            "data": {
                "token": "neexistujuciToken"
            }
        }).then(() => {
            throw Error
        }).catch(error => {
            assert(error.response.data.status === "Failed")
            assert(error.response.status === 404)
        })
    })
})
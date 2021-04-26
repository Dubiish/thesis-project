const assert = require("assert")
const axios = require("axios")
const mongoose = require("mongoose")

const server = "http://localhost:3000"
const mongoServer = "mongodb://localhost/bp"

describe("Pridanie nameraných dát", () => {

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

    it("Séria dát v správnom formáte - teplomer", () => {
        return axios.post(server+"/devices", {
            "name": "Thermometer01",
            "address": "192.168.1.2",
            "location": "bedroom",
            "type": "thermometer"
        }).then(device => {
            const token = device.data.token
            return Promise.all([
                axios.post(server+"/data", {"token": token, "value": 10.5}),
                axios.post(server+"/data", {"token": token, "value": 11}),
                axios.post(server+"/data", {"token": token, "value": 9.86}),
                axios.post(server+"/data", {"token": token, "value": 12.2}),
                axios.post(server+"/data", {"token": token, "value": 11.3}),
            ]).then(result => {
                result.forEach(item => {
                    assert(item.status === 201)
                    assert(item.data.status === "OK")    
                })
            }).catch(() => {
                throw Error
            })
        })
    })

    it("Záznam v nespravnom formáte - teplomer", () => {
        return axios.post(server+"/devices", {
            "name": "Thermometer02",
            "address": "192.168.1.3",
            "location": "bedroom",
            "type": "thermometer"
        }).then(device => {
            const token = device.data.token
            return axios.post(server+"/data", {"token": token, "measurement": 10.5}).then((result) => {
                throw Error
            }).catch(error => {
                assert(error.response.status === 400)
                assert(error.response.data.status === "Failed")
            })
        })
    })

    it("Séria dát v správnom formáte - svetelný senzor", () => {
        return axios.post(server+"/devices", {
            "name": "LightSens01",
            "address": "192.168.1.4",
            "location": "kitchen",
            "type": "lightsens"
        }).then(device => {
            const token = device.data.token
            return Promise.all([
                axios.post(server+"/data", {"token": token, "value": 221.9329}),
                axios.post(server+"/data", {"token": token, "value": 200.8782}),
                axios.post(server+"/data", {"token": token, "value": 1.8329}),
                axios.post(server+"/data", {"token": token, "value": 2.9832}),
                axios.post(server+"/data", {"token": token, "value": 210.3321}),
            ]).then(result => {
                result.forEach(item => {
                    assert(item.status === 201)
                    assert(item.data.status === "OK")    
                })
            }).catch(() => {
                throw Error
            })
        })
    })

    it("Záznam v nespravnom formáte - svetelný senzor", () => {
        return axios.post(server+"/devices", {
            "name": "LightSens02",
            "address": "192.168.1.5",
            "location": "kitchen",
            "type": "lightsens"
        }).then(device => {
            const token = device.data.token
            return axios.post(server+"/data", {"token": token, "hodnota": 1}).then((result) => {
                throw Error
            }).catch(error => {
                assert(error.response.status === 400)
                assert(error.response.data.status === "Failed")
            })
        })
    })
    
    it("Séria dát v správnom formáte - senzor vlhkosti", () => {
        return axios.post(server+"/devices", {
            "name": "HumiditySens01",
            "address": "192.168.1.6",
            "location": "garden",
            "type": "humiditysens"
        }).then(device => {
            const token = device.data.token
            return Promise.all([
                axios.post(server+"/data", {"token": token, "value": 221.9329}),
                axios.post(server+"/data", {"token": token, "value": 200.8782}),
                axios.post(server+"/data", {"token": token, "value": 1.8329}),
                axios.post(server+"/data", {"token": token, "value": 2.9832}),
                axios.post(server+"/data", {"token": token, "value": 210.3321}),
            ]).then(result => {
                result.forEach(item => {
                    assert(item.status === 201)
                    assert(item.data.status === "OK")    
                })
            }).catch(() => {
                throw Error
            })
        })
    })

    it("Záznam v nespravnom formáte - senzor vlhkosti", () => {
        return axios.post(server+"/devices", {
            "name": "humiditySens02",
            "address": "192.168.1.7",
            "location": "garden",
            "type": "humiditysens"
        }).then(device => {
            const token = device.data.token
            return axios.post(server+"/data", {"token": token, "hodnota": 1}).then((result) => {
                throw Error
            }).catch(error => {
                assert(error.response.status === 400)
                assert(error.response.data.status === "Failed")
            })
        })
    })
})

describe("Práca s lampou", () => {
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

    it("Získanie stavu existujúcej lampy", () => {
        return axios.post(server+"/devices", {
            "name": "lamp01",
            "address": "192.168.1.8",
            "location": "garden",
            "type": "lamp"
        }).then(device => {
            const token = device.data.token
            return axios.get(server+`/data/lamp?token=${token}`).then((result) => {
                assert(result.status === 200)
                assert(result.data.status === "OK")
                assert(Object.keys(result.data.data).length > 0)
            }).catch(() => {
                throw Error
            })
        })
    })

    it("Získanie stavu neexistujúcej lampy", () => {
        return axios.get(server+"/data/lamp?token=neexistujuciToken").then(result => {
            throw Error
        }).catch(error => {
            assert(error.response.status === 404)
            assert(error.response.data.status === "Failed")
        })
    })

    it("Zmena stavu existujúcej lampy", () => {
        return axios.post(server+"/devices", {
            "name": "lamp02",
            "address": "192.168.1.9",
            "location": "garden",
            "type": "lamp"
        }).then(device => {
            const token = device.data.token
            return axios.put(server+"/data/lamp", {
                "token": token, 
                "isOn": true, 
                "hue": 30, 
                "sat": 30, 
                "brightness": 100
            }).then(res => {
                assert(res.status === 200)
                assert(res.data.status === "OK")
                assert(res.data.data.isOn)
            }).catch(() => {
                throw Error
            })
        })
    })

    it("Zmena stavu neexistujúcej lampy", () => {
        return axios.put(server+"/data/lamp", {
            "token": "neexistujuciToken", 
            "isOn": true, 
            "hue": 30, 
            "sat": 30,
            "brightness": 100
        }).then(res => {
            throw Error
        }).catch(error => {
            assert(error.response.status === 404)
            assert(error.response.data.status === "Failed")
        })
    })
})

describe("Práca s dátami", () => {

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

    it("Úprava pridaného záznamu dát", () => {
        return axios.post(server+"/devices", {
            "name": "thermometer01",
            "type": "thermometer",
            "address": "192.168.0.1",
            "location": "bedroom"
        }).then(device => {
            const token = device.data.token
            return axios.post(server+"/data", {
                "token": token,
                "value": 1
            }).then(dataResponse => {
                const timestamp = dataResponse.data.data.timestamp
                return axios.get(server+`/data?startDate=${timestamp}&endDate=${timestamp}&token=${token}`).then(valueResponse => {
                    const id = valueResponse.data.data.data[0].id
                    return axios.put(server+`/data/${id}`, {
                        "token": token,
                        "value": 3
                    }).then(res => {
                        assert(res.status === 200)
                        assert(res.data.status === "OK")
                    })
                })
            })
        })
    })

    it("Odstránenie pridaných dát", () => {
        return axios.post(server+"/devices", {
            "name": "thermometer02",
            "type": "thermometer",
            "address": "192.168.0.2",
            "location": "bedroom"
        }).then(device => {
            const token = device.data.token
            return axios.post(server+"/data", {
                "token": token,
                "value": 2
            }).then(dataResponse => {
                const timestamp = dataResponse.data.data.timestamp
                return axios.delete(server+`/data?startDate=${timestamp}&endDate=${timestamp}`, {
                    data: {
                        "token": token
                    }
                }).then(res => {
                    assert(res.status === 200)
                    assert(res.data.status === "OK")
                })
            })
        })
    })

    it("Získanie konkrétneho záznamu dát na základe časového filtra", () => {
        return axios.post(server+"/devices", {
            "name": "thermometer03",
            "type": "thermometer",
            "address": "192.168.0.3",
            "location": "bedroom"
        }).then(device => {
            const token = device.data.token
            return axios.post(server+"/data", {
                "token": token,
                "value": 1
            }).then(dataResponse => {
                const timestamp = dataResponse.data.data.timestamp
                return axios.get(server+`/data?startDate=${timestamp}&endDate=${timestamp}&token=${token}`).then(res => {
                    assert(res.status === 200)
                    assert(res.data.status === "OK")
                    assert(res.data.data.data[0].value === 1)
                })
            })
        })
    })
})
var express = require("express")
router = express.Router()

const DeviceRegister = require(".././device-register")
var devReg = new DeviceRegister()

// Pridanie nového zariadenia
router.post("/", async (req, res) => {
    console.log("POST >> New device")
    if(!req.body) {
        res.status(400).json({
            "status": "Failed",
            "message" : "Request failed, request body is empty"
        }).end()
    } else {
        let result = await devReg.registerDevice(req.body)
        if(isNaN(result)) {
            res.status(201).json({
                "status": "OK",
                "token": result
            }).end()
        } else {
            res.status(result).json({
                "status": "Failed",
                "message": "Request failed, check status code for more info or try again"
            }).end()
        }
    }
})

// Získanie zariadenia/zariadení
router.get("/", async (req, res) => {
    let devices = null
    if(Object.keys(req.query).length === 0) {
        if(req.body.token) {
            console.log("GET >> Device (token)")
            devices = await devReg.getDevices({"token": req.body.token})
        } else {
            console.log("GET >> Devices (all)")
            devices = await devReg.getDevices(null)
        }
    } else {
        console.log("GET >> Devices (filtered)")
        devices = await devReg.getDevices(req.query)
    }
    if(isNaN(devices)) {
        res.status(200).json({
            "status": "OK",
            devices
        }).end()
    } else {
        if(devices == 204) {
            res.status(200).json({
                "status": "OK",
                "devices": []
            }).end()
        } else {
            res.status(devices).json({
                "status": "Failed",
                "message": "Request failed, check status code for more info or try again"
            }).end()
        }
    }
})

// Získanie teplomerov
router.get("/thermometers", async (req, res) => {
    console.log("GET >> Thermometers")
    let devices = await devReg.getDevices({"type": "thermometer"})
    if(isNaN(devices)) {
        res.status(200).json({
            "status": "OK",
            devices
        }).end()
    } else {
        if(devices == 204) {
            res.status(200).json({
                "status": "OK",
                "devices": []
            }).end()
        } else {
            res.status(devices).json({
                "status": "Failed",
                "message": "Request failed, check status code for more info or try again"
            }).end()
        }
    }
})

// Získanie svetelných senzorov
router.get("/lightsensors", async (req, res) => {
    console.log("GET >> Light sensors")
    let devices = await devReg.getDevices({"type": "lightsens"})
    if(isNaN(devices)) {
        res.status(200).json({
            "status": "OK",
            devices
        }).end()
    } else {
        if(devices == 204) {
            res.status(200).json({
                "status": "OK",
                "devices": []
            }).end()
        } else {
            res.status(devices).json({
                "status": "Failed",
                "message": "Request failed, check status code for more info or try again"
            }).end()
        }
    }
})

// Získanie senzorov vlhkosti
router.get("/humiditysensors", async (req, res) => {
    console.log("GET >> Humidity sensors")
    let devices = await devReg.getDevices({"type": "humiditysens"})
    if(isNaN(devices)) {
        res.status(200).json({
            "status": "OK",
            devices
        }).end()
    } else {
        if(devices == 204) {
            res.status(200).json({
                "status": "OK",
                "devices": []
            }).end()
        } else {
            res.status(devices).json({
                "status": "Failed",
                "message": "Request failed, check status code for more info or try again"
            }).end()
        }
    }
})

// Získanie lámp
router.get("/lamps", async (req, res) => {
    console.log("GET >> Lamps")
    let devices = await devReg.getDevices({"type": "lamp"})
    if(isNaN(devices)) {
        res.status(200).json({
            "status": "OK",
            devices
        }).end()
    } else {
        if(devices == 204) {
            res.status(200).json({
                "status": "OK",
                "devices": []
            }).end()
        } else {
            res.status(devices).json({
                "status": "Failed",
                "message": "Request failed, check status code for more info or try again"
            }).end()
        }
    }
})

// Aktualizácia zariadenia
router.put("/", async (req, res) => {
    console.log("PUT >> Device")
    let body = req.body
    if(!body.token) {
        res.status(400).json({
            "status": "Failed",
            "message": "Request failed, request body is missing crucial items"
        }).end()
    } else {
        let token = body.token
        delete body.token
        let result = await devReg.updateDevice(token, body)
        if(isNaN(result)) {
            res.status(200).json({
                "status": "OK",
                "device": result
            }).end()
        } else {
            res.status(result).json({
                "status": "Failed",
                "message": "Request failed, check status code for more info or try again"
            }).end()
        }
    }
})

// Odstránenie zariadenia
router.delete("/", async (req, res) => {
    console.log("DELETE >> Device")
    if(!req.body.token) {
        res.status(400).json({
            "status": "Failed",
            "message": "Request is missing device token"
        }).end()
    }
    let result = await devReg.removeDevice(req.body.token)
    if(result == 204) {
        res.status(200).json({
            "status": "OK",
            "message": "Item was successfuly deleted"
        }).end()
    } else if(result == 404) {
        res.status(404).json({
            "status": "Failed",
            "message": "Item not found"
        }).end()
    } else {
        res.status(result).json({
            "status": "Failed",
            "message": "Request failed, check status code for more info or try again"
        }).end()
    }
})

module.exports = router
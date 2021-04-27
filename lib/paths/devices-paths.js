var express = require("express")
router = express.Router()

const DeviceRegister = require(".././device-register")
var devReg = new DeviceRegister()

// POST Device
router.post("/", async (req, res) => {
    console.log("POST >> New device")
    // Kontrola ci nie je telo prazdne
    if(!req.body) {
        res.status(400).json({
            "status": "Failed",
            "message" : "Request failed, request body is empty"
        }).end()
    } else {
        // Registracia zariadenia
        let result = await devReg.registerDevice(req.body)
        // Odpoved
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

// GET Devices podla filtra
router.get("/", async (req, res) => {
    let devices = null
    // Kontrola ci je v query specifikovany filter
    if(Object.keys(req.query).length === 0) {
        if(req.body.token) {
            // Ziskanie zoznamu zariadeni na zaklade tokenu zariadenia
            console.log("GET >> Device (token)")
            devices = await devReg.getDevices({"token": req.body.token})
        } else {
            console.log("GET >> Devices (all)")
            // Ziskanie nefiltrovaneho zoznamu vsetky zariadeni
            devices = await devReg.getDevices(null)
        }
    } else {
        console.log("GET >> Devices (filtered)")
        // Ziskanie filtrovaneho zoznamu zariadeni
        devices = await devReg.getDevices(req.query)
    }
    // Odpoved
    if(isNaN(devices)) {
        // Ak je odpoved v poriadku
        res.status(200).json({
            "status": "OK",
            devices
        }).end()
    } else {
        if(devices == 204) {
            // Ak je vysledny zoznam zariadeni prazdny
            res.status(200).json({
                "status": "OK",
                "devices": []
            }).end()
        } else {
            // Vypise chybovu hlasku
            res.status(devices).json({
                "status": "Failed",
                "message": "Request failed, check status code for more info or try again"
            }).end()
        }
    }
})

router.get("/thermometers", async (req, res) => {
    console.log("GET >> Thermometers")
    let devices = await devReg.getDevices({"type": "thermometer"})
    // Odpoved
    if(isNaN(devices)) {
        // Ak je odpoved v poriadku
        res.status(200).json({
            "status": "OK",
            devices
        }).end()
    } else {
        if(devices == 204) {
            // Ak je vysledny zoznam zariadeni prazdny
            res.status(200).json({
                "status": "OK",
                "devices": []
            }).end()
        } else {
            // Vypise chybovu hlasku
            res.status(devices).json({
                "status": "Failed",
                "message": "Request failed, check status code for more info or try again"
            }).end()
        }
    }
})

router.get("/lightsensors", async (req, res) => {
    console.log("GET >> Light sensors")
    let devices = await devReg.getDevices({"type": "lightsens"})
    // Odpoved
    if(isNaN(devices)) {
        // Ak je odpoved v poriadku
        res.status(200).json({
            "status": "OK",
            devices
        }).end()
    } else {
        if(devices == 204) {
            // Ak je vysledny zoznam zariadeni prazdny
            res.status(200).json({
                "status": "OK",
                "devices": []
            }).end()
        } else {
            // Vypise chybovu hlasku
            res.status(devices).json({
                "status": "Failed",
                "message": "Request failed, check status code for more info or try again"
            }).end()
        }
    }
})

router.get("/humiditysensors", async (req, res) => {
    console.log("GET >> Humidity sensors")
    let devices = await devReg.getDevices({"type": "humiditysens"})
    // Odpoved
    if(isNaN(devices)) {
        // Ak je odpoved v poriadku
        res.status(200).json({
            "status": "OK",
            devices
        }).end()
    } else {
        if(devices == 204) {
            // Ak je vysledny zoznam zariadeni prazdny
            res.status(200).json({
                "status": "OK",
                "devices": []
            }).end()
        } else {
            // Vypise chybovu hlasku
            res.status(devices).json({
                "status": "Failed",
                "message": "Request failed, check status code for more info or try again"
            }).end()
        }
    }
})

router.get("/lamps", async (req, res) => {
    console.log("GET >> Lamps")
    let devices = await devReg.getDevices({"type": "lamp"})
    // Odpoved
    if(isNaN(devices)) {
        // Ak je odpoved v poriadku
        res.status(200).json({
            "status": "OK",
            devices
        }).end()
    } else {
        if(devices == 204) {
            // Ak je vysledny zoznam zariadeni prazdny
            res.status(200).json({
                "status": "OK",
                "devices": []
            }).end()
        } else {
            // Vypise chybovu hlasku
            res.status(devices).json({
                "status": "Failed",
                "message": "Request failed, check status code for more info or try again"
            }).end()
        }
    }
})

// PUT Device
router.put("/", async (req, res) => {
    console.log("PUT >> Device")
    let body = req.body
    // Kontrola ci je na vstupe telo a taktiez aj token
    if(!body.token) {
        res.status(400).json({
            "status": "Failed",
            "message": "Request failed, request body is missing crucial items"
        }).end()
    } else {
        // Aktualizacia zariadenia
        let token = body.token
        delete body.token
        let result = await devReg.updateDevice(token, body)
        // odpoved
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

// DELETE Device
router.delete("/", async (req, res) => {
    console.log("DELETE >> Device")
    // Kontrola ci je na vstupe zadanay token
    if(!req.body.token) {
        res.status(400).json({
            "status": "Failed",
            "message": "Request is missing device token"
        }).end()
    }
    // Odstranenie zariadenia
    let result = await devReg.removeDevice(req.body.token)
    // Odpoved
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
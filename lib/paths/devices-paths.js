var express = require("express")
router = express.Router()

const DeviceRegister = require(".././device-register")
var devReg = new DeviceRegister()

// POST Device
router.post("/", async (req, res) => {
    console.log("POST >> New device")
    // Kontrola ci nie je telo prazdne
    if(!req.body) {
        res.json({
            "status": "Failed",
            "message" : "Request failed, request body is empty"
        }).status(400).end()
    } else {
        // Registracia zariadenia
        let result = await devReg.registerDevice(req.body)
        // Odpoved
        if(isNaN(result)) {
            res.json({
                "status": "OK",
                "token": result
            }).status(201).end()
        } else {
            res.json({
                "status": "Failed",
                "message": "Request failed, check status code for more info or try again"
            }).status(result).end()
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
        res.json({
            "status": "OK",
            devices
        }).status(200).end()
    } else {
        if(devices == 204) {
            // Ak je vysledny zoznam zariadeni prazdny
            res.json({
                "status": "OK",
                "devices": []
            }).status(200).end()
        } else {
            // Vypise chybovu hlasku
            res.json({
                "status": "Failed",
                "message": "Request failed, check status code for more info or try again"
            }).status(devices).end()
        }
    }
})

router.get("/thermometers", async (req, res) => {
    console.log("GET >> Thermometers")
    let devices = await devReg.getDevices({"type": "thermometer"})
    // Odpoved
    if(isNaN(devices)) {
        // Ak je odpoved v poriadku
        res.json({
            "status": "OK",
            devices
        }).status(200).end()
    } else {
        if(devices == 204) {
            // Ak je vysledny zoznam zariadeni prazdny
            res.json({
                "status": "OK",
                "devices": []
            }).status(200).end()
        } else {
            // Vypise chybovu hlasku
            res.json({
                "status": "Failed",
                "message": "Request failed, check status code for more info or try again"
            }).status(devices).end()
        }
    }
})

router.get("/lightsensors", async (req, res) => {
    console.log("GET >> Light sensors")
    let devices = await devReg.getDevices({"type": "lightsens"})
    // Odpoved
    if(isNaN(devices)) {
        // Ak je odpoved v poriadku
        res.json({
            "status": "OK",
            devices
        }).status(200).end()
    } else {
        if(devices == 204) {
            // Ak je vysledny zoznam zariadeni prazdny
            res.json({
                "status": "OK",
                "devices": []
            }).status(200).end()
        } else {
            // Vypise chybovu hlasku
            res.json({
                "status": "Failed",
                "message": "Request failed, check status code for more info or try again"
            }).status(devices).end()
        }
    }
})

router.get("/humiditysensors", async (req, res) => {
    console.log("GET >> Humidity sensors")
    let devices = await devReg.getDevices({"type": "humiditysens"})
    // Odpoved
    if(isNaN(devices)) {
        // Ak je odpoved v poriadku
        res.json({
            "status": "OK",
            devices
        }).status(200).end()
    } else {
        if(devices == 204) {
            // Ak je vysledny zoznam zariadeni prazdny
            res.json({
                "status": "OK",
                "devices": []
            }).status(200).end()
        } else {
            // Vypise chybovu hlasku
            res.json({
                "status": "Failed",
                "message": "Request failed, check status code for more info or try again"
            }).status(devices).end()
        }
    }
})

router.get("/lamps", async (req, res) => {
    console.log("GET >> Lamps")
    let devices = await devReg.getDevices({"type": "lamp"})
    // Odpoved
    if(isNaN(devices)) {
        // Ak je odpoved v poriadku
        res.json({
            "status": "OK",
            devices
        }).status(200).end()
    } else {
        if(devices == 204) {
            // Ak je vysledny zoznam zariadeni prazdny
            res.json({
                "status": "OK",
                "devices": []
            }).status(200).end()
        } else {
            // Vypise chybovu hlasku
            res.json({
                "status": "Failed",
                "message": "Request failed, check status code for more info or try again"
            }).status(devices).end()
        }
    }
})

// PUT Device
router.put("/", async (req, res) => {
    console.log("PUT >> Device")
    let body = req.body
    // Kontrola ci je na vstupe telo a taktiez aj token
    if(!body.token) {
        res.json({
            "status": "Failed",
            "message": "Request failed, request body is missing crucial items"
        }).status(400).end()
    } else {
        // Aktualizacia zariadenia
        let token = body.token
        delete body.token
        let result = await devReg.updateDevice(token, body)
        // odpoved
        if(isNaN(result)) {
            res.json({
                "status": "OK",
                "device": result
            }).status(200).end()
        } else {
            res.json({
                "status": "Failed",
                "message": "Request failed, check status code for more info or try again"
            }).status(result).end()
        }
    }
})

// DELETE Device
router.delete("/", async (req, res) => {
    console.log("DELETE >> Device")
    // Kontrola ci je na vstupe zadanay token
    if(!req.body.token) {
        res.json({
            "status": "Failed",
            "message": "Request is missing device token"
        }).status(400).end()
    }
    // Odstranenie zariadenia
    let result = await devReg.removeDevice(req.body.token)
    // Odpoved
    if(result == 204) {
        res.json({
            "status": "OK",
            "message": "Item was successfuly deleted"
        }).status(200).end()
    } else if(result == 404) {
        res.json({
            "status": "Failed",
            "message": "Item not found"
        }).status(404).end()
    } else {
        res.json({
            "status": "Failed",
            "message": "Request failed, check status code for more info or try again"
        }).status(result).end()
    }
})

module.exports = router
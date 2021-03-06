var express = require("express")
router = express.Router()

const DeviceRegister = require("./device-register")
var devReg = new DeviceRegister()

const DataHandler = require("./data-handler")
var dataHandler = new DataHandler()

// GET Devices podla filtra
router.get("/devices", async (req, res) => {

    // Kontrola ci je na vstupe nejaky filter
    if(Object.keys(req.query).length === 0) {
        console.log("GET >> Devices (all)")

        // Ziskanie zoznamu zariadeni
        let devices = await devReg.getDevices(null)

        // Odpoved
        if(isNaN(devices)) {
            res.json(devices).status(200).end()
        } else {
            res.status(devices).end()
        }
    } else {
        console.log("GET >> Devices (filtered)")

        // Ziskanie zoznamu zariadeni
        let devices = await devReg.getDevices(req.query)

        // Odpoved
        if(isNaN(devices)) {
            res.json(devices).status(200).end()
        } else {
            res.status(devices).end()
        }
    }
})

// GET Devices podla tokenu
router.get("/devices/:token", async (req, res) => {
    console.log("GET >> Devices (by token)")

    // Ziskanie zoznamu zariadeni
    let devices = await devReg.getDevices({"token": req.params.token})

    // Odpoved
    if(isNaN(devices)) {
        res.json(devices[0]).status(200).end()
    } else {
        res.status(devices).end()
    }
})

// POST Device
router.post("/devices", async (req, res) => {
    console.log("POST >> New device")

    // Kontrola ci nie je telo prazdne
    if(!req.body) {
        res.status(400).end()
    } else {

        // Registracia zariadenia
        let result = await devReg.registerDevice(req.body)

        // Odpoved
        if(isNaN(result)) {
            res.json({"token": result}).status(200).end()
        } else {
            res.status(result).end()
        }
    }
})

// DELETE Device
router.delete("/devices/:token", async (req, res) => {
    console.log("DELETE >> Device")

    // Kontrola ci je na vstupe zadanay token
    if(!token) {
        res.status(400).end()
    }

    // Odstranenie zariadenia
    let result = await devReg.removeDevice(req.params.token)

    // Odpoved
    res.status(result).end()
})

// PUT Deviec
router.put("/devices/:token", async (req, res) => {
    console.log("PUT >> Device")

    // Kontrola ci je na vstupe telo a taktiez aj token
    if(!req.body || !req.params.token) {
        res.status(400).end()
    } else {

        // Aktualizacia zariadenia
        let result = await devReg.updateDevice(req.params.token, req.body)

        // odpoved
        if(isNaN(result)) {
            res.json(result).status(200).end()
        } else {
            res.status(result).end()
        }
    }
})

// POST Data
router.post("/data/:token", async (req, res) => {
    console.log("POST >> Data")

    // Ulozenie tela a tokenu do lokalnych premennych
    let token = req.params.token
    let body = req.body

    // Kontrola ci nie je telo alebo token prazdne
    if(!body || !token) {
        res.status(400).end()
    } else {

        // Zapis dat
        let result = await dataHandler.postData(token, body)

        // Odpoved
        res.status(result).end()
    }
})

// GET Data (token)
router.get("/data/:token", async (req, res) => {
    console.log("GET >> Data (by token)")

    // Ulozenie tokenu do lokalnej premennej
    let token = req.params.token

    // Kontrola ci je vstupny token prazdny
    if(!token) {
        res.status(400).end()
    } else {

        // Ziskanie dat
        let response = await dataHandler.getDataByToken(token)

        // odpoved
        if(isNaN(response)) {
            res.json(response).status(200).end()
        } else {
            res.status(response).end()
        }
    }
})

// GET Data (povinny filter)
router.get("/data", async (req, res) => {
    console.log("GET >> Data (filtered)")

    // Kontrola ci je filter prazdny
    if(Object.keys(req.query).length === 0) {
        res.status(400).end()
    } else {

        // Ziskanie dat
        let response = await dataHandler.getDataByFilter(req.query)

        // Odpoved
        if(isNaN(response)) {
            res.json(response).status(200).end()
        } else {
            res.status(response).end()
        }
    }
})

router.get("/", (req, res) => {
    res.send("API rozhranie na baze HTTP pre IoT zariadenia")
})

module.exports = router
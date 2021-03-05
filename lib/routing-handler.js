var express = require("express")
router = express.Router()

const DeviceRegister = require("./device-register")
var devReg = new DeviceRegister()

const DataHandler = require("./data-handler")
var dataHandler = new DataHandler()

// GET DEVICES
router.get("/devices", async (req, res) => {

    // Check if there is any query
    if(Object.keys(req.query).length === 0) {
        console.log("GET >> Devices (all)")
        let devices = await devReg.getDevices(null)
        if(isNaN(devices)) {
            res.json(devices).status(200).end()
        } else {
            res.status(devices).end()
        }
    } else {
        console.log("GET >> Devices (filtered)")
        let devices = await devReg.getDevices(req.query)
        if(isNaN(devices)) {
            res.json(devices).status(200).end()
        } else {
            res.status(devices).end()
        }
    }
})

router.get("/devices/:token", async (req, res) => {
    console.log("GET >> Devices (by token)")
    let devices = await devReg.getDevices({"token": req.params.token})
    if(isNaN(devices)) {
        res.json(devices[0]).status(200).end()
    } else {
        res.status(devices).end()
    }
})

router.post("/devices", async (req, res) => {
    console.log("POST >> New device")
    if(!req.body) {
        res.status(400).end()
    } else {
        let result = await devReg.registerDevice(req.body)
        if(isNaN(result)) {
            res.json({"token": result}).status(200).end()
        } else {
            res.status(result).end()
        }
    }
})

router.delete("/devices/:token", async (req, res) => {
    console.log("DELETE >> Device")
    if(!token) {
        res.status(400).end()
    }
    let result = await devReg.removeDevice(req.params.token)
    res.status(result).end()
})

router.put("/devices/:token", async (req, res) => {
    console.log("PUT >> Device")
    if(!req.body || !req.params.token) {
        res.status(400).end()
    } else {
        let result = await devReg.updateDevice(req.params.token, req.body)
        if(isNaN(result)) {
            res.json(result).status(200).end()
        } else {
            res.status(result).end()
        }
    }
})

// TODO REWORK RETURN TYPES
router.post("/data/:token", async (req, res) => {
    console.log("POST >> Data")
    var token = req.params.token
    var body = req.body

    if(!body || !token) {
        res.status(400).end()
    } else {
        let result = await dataHandler.postData(token, body)
        res.status(result).end()
    }
})

router.get("/data/:token", async (req, res) => {
    console.log("GET >> Data (by token)")
    let token = req.params.token
    if(!token) {
        res.status(400).end()
    } else {
        let response = await dataHandler.getDataByToken(token)
        if(isNaN(response)) {
            res.json(response).status(200).end()
        } else {
            res.status(response).end()
        }
    }
})

router.get("/data", async (req, res) => {
    console.log("GET >> Data (filtered)")
    if(Object.keys(req.query).length === 0) {
        res.status(400).end()
    } else {
        let response = await dataHandler.getDataByFilter(req.query)
        if(isNaN(response)) {
            res.json(response).status(200).end()
        } else {
            res.status(response).end()
        }
    }
})

router.get("/", (req, res) => {
    res.send("Main route")
})

module.exports = router
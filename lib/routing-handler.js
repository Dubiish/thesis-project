var express = require("express")
router = express.Router()

const DeviceRegister = require("./device-register")
var devReg = new DeviceRegister()

const DataHandler = require("./data-handler")
var dataHandler = new DataHandler()

// GET DEVICES
router.get("/devices", (req, res) => {

    // Check if there is any query
    if(Object.keys(req.query).length === 0) {
        console.log("Getting list of all devices")
        devReg.getDevices(null).then((devices) => {
            if(devices) {
                res.json(devices).status(200).end()
            } else {
                res.status(204).end()
            }
        })
    } else {
        console.log("Getting filtered list of devices")
        devReg.getDevices(req.query).then((devices) => {
            if(devices) {
                res.json(devices).status(200).end()
            } else {
                res.status(204).end()
            }
        })
    }
})

// TODO REWORK RETURN TYPES
router.get("/devices/:token", (req, res) => {
    console.log("Getting device by token")
    devReg.getDevices({"token": req.params.token}).then(devices => {
        if(devices == 1) {
            res.status(204).end()
        } else if(devices == 2) {
            res.status(400).end()
        } else {
            res.json(devices).status(200).end()
        }
    })
})

// TODO REWORK RETURN TYPES
router.post("/devices", (req, res) => {
    if(!req.body) {
        res.send("No body was specified").status(400).end()
    } else {
        console.log("Registering new device")
        devReg.registerDevice(req.body).then(result => {
            if(result == 3) {
                res.status(500).end()
            } else if(result == 2) {
                res.status(400).end()
            } else if(result == 1) {
                res.status(403).end()
            } else {
                res.json(result).status(201).end()
            }
        })
    }
})

router.delete("/devices/:token", (req, res) => {
    devReg.getDevices({"token": req.params.token}).then((device) => {
        if(device) {
            console.log("Removing existing device")
            devReg.removeDevice(req.params.token).then((response) => {
                if(response) {
                    res.status(204).end()
                } else {
                    res.status(500).end()
                }
            })
        } else {
            res.status(404).end()
        }
    })
})

router.put("/devices/:token", (req, res) => {
    if(!req.body) {
        res.status(400).end()
    } else {
        devReg.getDevices({"token": req.params.token}).then(device => {
            if(device) {
                console.log("Updating existing device")
                devReg.updateDevice(req.params.token, req.body).then(result => {
                    if(result) {
                        res.status(200).end()
                    } else {
                        res.status(500).end()
                    }
                })
            } else {
                res.status(404).end()
            }
        })
    }
})

// TODO REWORK RETURN TYPES
router.post("/data/:token", (req, res) => {
    var token = req.params.token
    var body = req.body

    if(!body || !token) {
        res.status(400).end()
    } else {
        devReg.getDevices({"token": token}).then(response => {
            if(response[0]) {
                dataHandler.postData(token, body).then(result => {
                    if(result == 1) {
                        res.status(404).end()
                    } else if(result == 2) {
                        res.status(400).end()
                    } else if(result == 3) {
                        res.status(500).end()
                    } else {
                        res.status(200).end()
                    }
                })
            } else {
                res.status(404).end()
            }
        })
    }
})

router.get("/data/:token", (req, res) => {
    var token = req.params.token
    if(!token) {
        res.status(400).end()
    } else {
        devReg.getDevices({"token": token}).then(devices => {
            if(devices[0]) {
                console.log("Fetching device data")
                dataHandler.getDataByToken(token).then((response) => {
                    if(response == 500) {
                        res.status(500).end()
                    } else if(response == 204) {
                        res.status(204).end()
                    } else {
                        res.json(response).status(200).end()
                    }
                })
            } else {
                res.status(404).end()
            }
        })
    }
})

router.get("/", (req, res) => {
    res.send("Main route")
})

module.exports = router
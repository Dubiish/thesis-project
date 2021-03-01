var express = require("express")
router = express.Router()

const DeviceRegister = require("./device-register")
var devReg = new DeviceRegister()

// GET DEVICES
router.get("/devices", (req, res) => {

    // Check if there is any query
    if(Object.keys(req.query).length === 0) {
        console.log("Getting list of all devices")
        devReg.getDevices(null).then((devices) => {
            if(devices) {
                res.json(devices).status(200).end()
            } else {
                res.send("No devices found").status(404).end()
            }
        })
    } else {
        console.log("Getting filtered list of devices")
        devReg.getDevices(req.query).then((devices) => {
            if(devices) {
                res.json(devices).status(200).end()
            } else {
                res.send("No query matching devices were found").status(404).end()
            }
        })
    }
})

router.get("/devices/:id", (req, res) => {
    console.log("Getting device by ID")
    devReg.getDevices({"_id": req.params.id}).then(device => {
        if(device) {
            res.json(device).status(200).end()
        } else {
            res.send("Device not found").status(404).end()
        }
    })
})

router.post("/devices", (req, res) => {
    if(!req.body) {
        res.send("No body was specified").status(400).end()
    } else {
        console.log("Registering new device")
        devReg.registerDevice(req.body).then((data) => {
            if(data) {
                res.json(data).status(200).end()
            } else {
                res.status(404)
                res.send("Something went wrong").end()
            }
        })
    }
})

router.delete("/devices/:id", (req, res) => {
    devReg.getDevices({"_id": req.params.id}).then((device) => {
        if(device) {
            console.log("Removing existing device")
            devReg.removeDevice(req.params.id).then((response) => {
                if(response) {
                    res.status(200).end()
                } else {
                    res.status(500).end()
                }
            })
        } else {
            res.status(404).end()
        }
    })
})

router.put("/devices/:id", (req, res) => {
    if(!req.body) {
        res.send("No device data were specified in request body!").status(400).end()
    } else {
        devReg.getDevices({"_id": req.params.id}).then(device => {
            if(device) {
                console.log("Updating existing device")
                devReg.updateDevice(req.params.id, req.body).then(result => {
                    if(result) {
                        res.status(200).end()
                    } else {
                        res.status(400).end()
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
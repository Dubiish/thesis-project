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
        console.log("Getting list of devices matching filter")

        devReg.getDevices(req.query).then((devices) => {
            if(devices) {
                res.json(devices).status(200).end()
            } else {
                res.send("No query matching devices were found").status(404).end()
            }
        })
    }

})

router.post("/devices", (req, res) => {
    if(!req.body) {
        res.send("No body was specified").status(400).end()
    } else {
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

router.get("/", (req, res) => {
    res.send("Main route")
})

module.exports = router
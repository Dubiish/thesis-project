var express = require("express")
router = express.Router()

const DataHandler = require(".././data-handler")
var dataHandler = new DataHandler()

// Vytvorenie záznamu dát
router.post("/", async (req, res) => {
    console.log("POST >> Data")
    let body = req.body
    let token = req.body.token
    if(!body || !token) {
        res.status(400).json({
            "status": "Failed",
            "message": "Request failed, request body is missing crucial items"
        }).end()
    } else {
        let result = await dataHandler.postData(token, body)
        if(isNaN(result)) {
            res.status(201).json({
                "status": "OK",
                "data": result
            }).end()
        } else {
            res.status(result).json({
                "status": "Failed",
                "message": "Request failed, check status code for more info or try again"
            }).end()
        }
    }
})

// Získanie záznamu/záznamov dát
router.get("/", async (req, res) => {
    let query = req.query
    if(!req.body.token && !req.query.token) {
        res.status(400).json({
            "status": "Failed",
            "message": "Request is missing device token"
        }).end()
    }
    let token = req.body.token ? req.body.token : query.token
    if(query.token) {
        delete query.token
    }
    let filter = query
    if(!token) {
        if(Object.keys(filter).length === 0) {
            res.status(400).json({
                "status": "Failed",
                "message": "Request failed, request is missing crucial items"
            }).end()
        } else {
            console.log("GET >> Data (filter)")
            let response = await dataHandler.getDataByFilter(query)
            if(isNaN(response)) {
                res.status(200).json({
                    "status": "OK",
                    "data": response
                }).end()
            } else {
                if(response == 204) {
                    res.status(200).json({
                        "status": "OK",
                        "data": []
                    }).end()
                } else {
                    res.status(response).json({
                        "status": "Failed",
                        "message": "Request failed, check status code for more info or try again"
                    }).end()
                }
            }
        }
    } else {
        console.log("GET >> Data (by token)")
        let response = await dataHandler.getDataByToken(token, filter)
        if(isNaN(response)) {
            res.status(200).json({
                "status": "OK",
                "data": response
            }).end()
        } else {
            if(response == 204) {
                res.status(200).json({
                    "status": "OK",
                    "data": []
                }).end()
            } else {
                res.status(response).json({
                    "status": "Failed",
                    "message": "Request failed, check status code for more info or try again"
                }).end()
            }
        }
    }
})

// Odstránenie záznamu/záznamov dát
router.delete("/", async (req, res) => {
    console.log("DELETE >> Data")
    let filter = req.query
    let token = req.body.token
    if(filter.token) {
        token = req.body.token ? req.body.token : filter.token
        delete filter.token
    }
    if(!token) {
        res.status(400).json({
            "status": "Failed",
            "message": "Request failed, request is missing crucial items"
        }).end()
    } else {
        let result = await dataHandler.deleteData(filter, token)
        if(result != 204) {
            res.status(result).json({
                "status": "Failed",
                "message": "Request failed, check status code for more info or try again"
            }).end()
        } else {
            res.status(200).json({
                "status": "OK",
                "message": "Item was successfuly deleted"
            }).end()
        }
    }
})

// Získanie stavu lampy
router.get("/lamp/:token", async(req, res) => {
    console.log("GET >> Lamp")
    if(!req.params.token) {
        res.status(400).json({
            "status": "Failed",
            "message": "Request failed, request is missing crucial items"
        }).end()
    } else {
        let token = req.params.token
        let response = await dataHandler.getLamp(token)
        if(isNaN(response)) {
            res.status(200).json({
                "status": "OK",
                "data": response
            }).end()
        } else {
            res.status(response).json({
                "status": "Failed",
                "message": "Request failed, check status code for more info or try again"
            }).end()
        }
    }
})

// Získanie konkrétneho záznamu dát
router.get("/:token/:id", async(req, res) => {
    console.log("GET >> Data (single record)")
    if(!req.params.token || !req.params.id) {
        res.status(400).json({
            "status": "Failed",
            "message": "Request failed, request is missing crucial items"
        }).end()
    } else {
        let result = await dataHandler.getSingleRecord(req.params.token, req.params.id)
        if(isNaN(result)) {
            res.status(200).json({
                "status": "OK",
                "data": result
            }).end()    
        } else {
            res.status(result).json({
                "status": "Failed",
                "message": "Request failed, check status code for more info or try again"
            }).end()
        }
    }
})

// Aktualizácia stavu lampy
router.put("/lamp", async (req, res) => {
    console.log("UPDATE >> Lamp")
    let body = req.body
    let token = body.token
    delete body.token
    if(!body || !token) {
        res.status(400).json({
            "status": "Failed",
            "message": "Request failed, request is missing crucial items"
        }).end()
    } else {
        let response = await dataHandler.updateLamp(token, body)
        if(isNaN(response)) {
            res.status(200).json({
                "status": "OK",
                "data": response
            }).end()
        } else {
            res.status(response).json({
                "status": "Failed",
                "message": "Request failed, check status code for more info or try again"
            }).end()
        }
    }
})

// Aktualizácia dát na základe ID dát
router.put("/:id", async (req, res) => {
    console.log("UPDATE >> Data")
    let body = req.body
    let token = req.body.token
    if(!token || !req.params.id) {
        res.status(400).json({
            "status": "Failed",
            "message": "Request failed, request is missing crucial items"
        }).end()
    } else {
        delete body.token
        let result = await dataHandler.updateData(body, token, req.params.id)
        if(result != 204) {
            res.status(result).json({
                "status": "Failed",
                "message": "Request failed, check status code for more info or try again"
            }).end()
        } else {
            res.status(200).json({
                "status": "OK",
                "message": "Item was successfuly updated"
            }).end()
        }
    }
})

module.exports = router
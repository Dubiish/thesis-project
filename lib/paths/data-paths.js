var express = require("express")
router = express.Router()

const DataHandler = require(".././data-handler")
var dataHandler = new DataHandler()

router.post("/", async (req, res) => {
    console.log("POST >> Data")
    // Ulozenie tela a tokenu do lokalnych premennych
    let body = req.body
    let token = req.body.token
    // Kontrola ci nie je telo alebo token prazdne
    if(!body || !token) {
        res.status(400).json({
            "status": "Failed",
            "message": "Request failed, request body is missing crucial items"
        }).end()
    } else {
        // Zapis dat
        let result = await dataHandler.postData(token, body)
        // Odpoved
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

router.get("/", async (req, res) => {
    let query = req.query
    // Ulozenie tokenu a filtra do lokalnych premennych
    if(!req.body.token && !req.query.token) {
        res.status(400).json({
            "status": "Failed",
            "message": "Request is missing device token"
        }).end()
    }
    let token = req.body.token ? req.body.token : query.token
    // Kontrola ci je token v dopyte, ak ano odstrani ho kedze dopy resp. filter je dalej posuvany
    if(query.token) {
        delete query.token
    }
    let filter = query
    // Kontrola ci je vstupny token prazdny
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
                // Technicka limitacia expressu, v pripade kodu 204 nie je mozne dodat telo ku odpovedi
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
        // Ziskanie dat
        let response = await dataHandler.getDataByToken(token, filter)
        // odpoved
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
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
        res.json({
            "status": "Failed",
            "message": "Request failed, request body is missing crucial items"
        }).status(400).end()
    } else {
        // Zapis dat
        let result = await dataHandler.postData(token, body)
        // Odpoved
        if(result == 201) {
            res.json({
                "status": "OK",
                "data": result
            }).status(201).end()
        } else {
            res.json({
                "status": "Failed",
                "message": "Request failed, check status code for more info or try again"
            }).status(result).end()
        }
    }
})

router.get("/", async (req, res) => {
    console.log("GET >> Data (by token)")
    // Ulozenie tokenu a filtra do lokálnych premenných
    let token = req.body.token
    let filter = req.query
    // Kontrola ci je vstupny token prazdny
    if(!token) {
        if(Object.keys(filter).length === 0) {
            res.json({
                "status": "Failed",
                "message": "Request failed, request is missing crucial items"
            }).status(400).end()
        } else {
            console.log("GET >> Data (filter)")
            let response = await dataHandler.getDataByFilter(req.query)
            if(isNaN(response)) {
                res.json({
                    "status": "OK",
                    "data": response
                }).status(200).end()
            } else {
                if(response == 204) {
                    res.json({
                        "status": "OK",
                        "data": []
                    }).status(200).end()
                } else {
                    res.json({
                        "status": "Failed",
                        "message": "Request failed, check status code for more info or try again"
                    }).status(response).end()
                }
            }
        }
    } else {
        // Ziskanie dat
        let response = await dataHandler.getDataByToken(token, filter)
        // odpoved
        if(isNaN(response)) {
            res.json({
                "status": "OK",
                "data": response
            }).status(200).end()
        } else {
            if(response == 204) {
                res.json({
                    "status": "OK",
                    "data": []
                }).status(200).end()
            } else {
                res.json({
                    "status": "Failed",
                    "message": "Request failed, check status code for more info or try again"
                }).status(response).end()
            }
        }
    }
})

router.get("/:id", async(req, res) => {
    console.log("GET >> Data (single record)")
    if(!req.body.token || !req.params.id) {
        res.json({
            "status": "Failed",
            "message": "Request failed, request is missing crucial items"
        }).status(400).end()
    } else {
        let result = await dataHandler.getSingleRecord(req.body.token, req.params.id)
        if(isNaN(result)) {
            res.json({
                "status": "OK",
                "data": result
            }).status(200).end()    
        } else {
            res.json({
                "status": "Failed",
                "message": "Request failed, check status code for more info or try again"
            }).status(result).end()
        }
    }
})

router.put("/:id", async (req, res) => {
    console.log("UPDATE >> Data")
    let body = req.body
    let token = req.body.token
    if(!token || !req.params.id) {
        res.json({
            "status": "Failed",
            "message": "Request failed, request is missing crucial items"
        }).status(400).end()
    } else {
        delete body.token
        let result = await dataHandler.updateData(body, token, req.params.id)
        if(result != 204) {
            res.json({
                "status": "Failed",
                "message": "Request failed, check status code for more info or try again"
            }).status(result).end()
        } else {
            res.json({
                "status": "OK",
                "message": "Item was successfuly updated"
            }).status(200).end()
        }
    }
})

router.delete("/", async (req, res) => {
    console.log("DELETE >> Data")
    let filter = req.query
    let token = req.params.token
    if(!token) {
        res.json({
            "status": "Failed",
            "message": "Request failed, request is missing crucial items"
        }).status(400).end()
    } else {
        let result = await dataHandler.deleteData(filter, token)
        if(result != 204) {
            res.json({
                "status": "Failed",
                "message": "Request failed, check status code for more info or try again"
            }).status(result).end()
        } else {
            res.json({
                "status": "OK",
                "message": "Item was successfuly deleted"
            }).status(200).end()
        }
    }
})

router.get("/lamp", async(req, res) => {
    console.log("GET >> Lamp")
    if(!req.body.token) {
        res.json({
            "status": "Failed",
            "message": "Request failed, request is missing crucial items"
        }).status(400).end()
    } else {
        let response = await dataHandler.getLamp(req.body.token)
        if(isNaN(response)) {
            res.json({
                "status": "OK",
                "data": response
            }).status(200).end()
        } else {
            res.json({
                "status": "Failed",
                "message": "Request failed, check status code for more info or try again"
            }).status(result).end()
        }
    }
})

router.put("/lamp", async (req, res) => {
    console.log("UPDATE >> Lamp")
    let body = req.body
    let token = body.token
    if(!body || !token) {
        res.json({
            "status": "Failed",
            "message": "Request failed, request is missing crucial items"
        }).status(400).end()
    } else {
        let response = await dataHandler.updateLamp(token, body)
        if(isNaN(response)) {
            res.json({
                "status": "OK",
                "data": response
            }).status(200).end()
        } else {
            res.json({
                "status": "Failed",
                "message": "Request failed, check status code for more info or try again"
            }).status(result).end()
        }
    }
})

module.exports = router
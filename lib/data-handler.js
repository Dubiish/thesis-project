const Database = require("./database-interface")

class DataHandler {

    constructor() {
        // Create connection to database via database interface module
        this.db = new Database()
    }

    async postData(device_token, data) {
        // TODO REWORK RETURN TYPES
        return this.db.getDevices({"token": device_token}).then(response => {
            if(response[0]) {
                if(response[0].type == "thermometer") {
                    console.log("Received thermometer data, parsing ...")

                    if(!data.value) {
                        return 2
                    }

                    let parsed_data = {
                        "token": device_token,
                        "value": data.value,
                    }
                    return this.db.writeData("thermometer", parsed_data).then(result => {
                        if(result) {
                            return 0
                        } else {
                            return 3
                        }
                    })
                } else {
                    return 1
                }
            } else {
                return 1
            }
        })
    }

    async getDataByToken(device_token) {
        return this.db.getDevices({"token": device_token}).then(devices => {
            var device = devices[0]

            return this.db.readData(device_token, device.type).then(data => {
                if(data == 500) {
                    return 500
                }
                if(data == 204) {
                    return {
                        device,
                        "data": null
                    }
                }

                let parsedData = []
                data.forEach(element => {
                    parsedData.push({
                        "value": element.value,
                        "createdAt": element.createdAt
                    })
                });
                return {
                    device,
                    "data": parsedData
                }
            })
        })
        
    }
}

module.exports = DataHandler
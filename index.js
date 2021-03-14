const express = require("express")
const app = express()
const bodyParser = require("body-parser")

const devices = require("./lib/paths/devices-paths")
const data = require("./lib/paths/data-paths")

const PORT = 3000

app.use(express.json())

app.use("/devices", devices)
app.use("/data", data)

app.listen(PORT, () => {
    console.log(`API is running and listening on http://localhost:${PORT}`)
})
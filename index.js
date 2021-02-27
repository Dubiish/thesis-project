const express = require("express")
const app = express()
const bodyParser = require("body-parser")

var routes = require("./lib/routing-handler")

const PORT = 3000

app.use(express.json())

app.use("/", routes)

app.listen(PORT, () => {
    console.log(`API is listening on http://localhost:${PORT}`)
})
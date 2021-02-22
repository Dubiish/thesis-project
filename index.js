const express = require("express")
const app = express()

var routes = require("./lib/routing-handler")

const PORT = 3000

app.use("/", routes)

app.listen(PORT, () => {
    console.log(`API is listening on http://localhost:${PORT}`)
})
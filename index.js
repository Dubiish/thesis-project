const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const fs = require('fs')
const marked = require("marked")

const devices = require("./lib/paths/devices-paths")
const data = require("./lib/paths/data-paths")

const PORT = 3000

app.use(express.json())

app.use("/devices", devices)
app.use("/data", data)

// Zakladna cesta, ktora vrati dokumentaciu
app.all('/', (req, res) => {

    var path = __dirname + '/README.md';
    var file = fs.readFileSync(path, 'utf8');
    res.send(marked(file.toString()));

    res.status(200).end()
})

app.listen(PORT, () => {
    console.log(`API is running and listening on http://localhost:${PORT}`)
})
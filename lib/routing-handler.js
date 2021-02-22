var express = require("express")
router = express.Router()

router.get("/", (req, res) => {
    res.send("Main route")
})

module.exports = router
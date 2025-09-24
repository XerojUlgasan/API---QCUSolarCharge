const express = require("express")
const router = express.Router()
const controller = require("../controllers/deviceController")

router.post("/insertEnergy", controller.postEnergy)

module.exports = router
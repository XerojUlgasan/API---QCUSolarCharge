const express = require("express")
const router = express.Router()
const controller = require("../controllers/deviceController")

router.get("/getDeviceHistory", controller.getDeviceHistory)
router.post("/insertEnergy", controller.postEnergy)
router.post("/addDevice", controller.addDevice)

module.exports = router
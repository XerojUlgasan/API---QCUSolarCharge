const express = require("express")
const router = express.Router()
const controller = require("../controllers/deviceController")

router.get("/getDeviceHistory", controller.getDeviceHistory)
router.post("/insertEnergy", controller.postEnergy) // per 1 hour
router.post("/addDevice", controller.addDevice)
router.post("/giveUpdates", controller.giveUpdates)
router.get("/checkExist", controller.checkExist)
router.post("/getConfig", controller.getConfig)
router.post("/setEnability", controller.setEnability)

module.exports = router
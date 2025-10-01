const express = require("express")
const router = express.Router()
const controller = require("../controllers/adminController")

router.get("/dashboard", controller.getDashboard)
router.get("/devices", controller.getDevices)
router.post("/updateReport", controller.updateReports)
router.post("/updateDevice", controller.updateDevices)
router.post("/sendResponseReport", controller.sendResponseReport)
router.post("/sendResponseContact", controller.sendResponseContact)

router.delete("/deleteDevice", controller.deleteDevice)

router.get("/getDeviceConfig", controller.getDeviceConfig)
router.post("/setDeviceConfig", controller.setDeviceConfig)

router.get("/getAdminInformation", controller.getAdminInformation)
router.post("/setAdminInformation", controller.setAdminInformation)

router.post("/changeAdminPassword", controller.changeAdminPassword)
router.post("/changeAdminUsername", controller.changeAdminUsername)

router.post("/sendOtp", controller.sendOtp)
router.post("/verifyOtp", controller.verifyOtp)
router.post("/changePassword", controller.changePassword)

module.exports = router
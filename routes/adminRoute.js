const express = require("express")
const router = express.Router()
const controller = require("../controllers/adminController")

router.get("/dashboard", controller.getDashboard)
router.get("/devices", controller.getDevices)
router.post("/updateReport", controller.updateReports)
router.post("/updateDevice", controller.updateDevices)
router.post("/sendResponse", controller.sendResponse)

module.exports = router
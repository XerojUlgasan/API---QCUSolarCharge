const express = require("express")
const router = express.Router()
const controller = require("../controllers/overviewController")

router.get("/getOverview", controller.getOverview)

module.exports = router
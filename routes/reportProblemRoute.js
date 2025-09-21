const express = require("express")
const app = express()
const router = express.Router()
const controller = require("../controllers/problemController")

router.get("/getReports", controller.getProblems)
router.post("/postReports", controller.setProblems)

module.exports = router
const express = require("express")
const app = express()
const router = express.Router()
const controller = require("../controllers/problemController")

router.get("/", controller.getProblems)
router.post("/", controller.setProblems)

module.exports = router
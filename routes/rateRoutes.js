const express = require("express")
const router = express.Router();
const rateController = require("../controllers/rateController")

router.get("/", rateController.getRates)

router.post("/", rateController.setRates)

module.exports = router
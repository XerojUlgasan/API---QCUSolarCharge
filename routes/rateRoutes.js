const express = require("express")
const router = express.Router();
const rateController = require("../controllers/rateController")

router.get("/getRates", rateController.getRates)

router.post("/postRates", rateController.setRates)

module.exports = router
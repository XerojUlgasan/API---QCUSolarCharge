const express = require("express")
const route = express.Router()
const controller = require("../controllers/transactionController")

route.get("/getTransactions", controller.getTransactions) // GET TRANSACTIONS

route.post("/postTransactions", controller.setTransaction)

module.exports = route
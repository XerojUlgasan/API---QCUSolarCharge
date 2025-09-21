const express = require("express")
const route = express.Router()
const controller = require("../controllers/transactionController")

route.get("/", controller.getTransactions) // GET TRANSACTIONS

route.post("/", controller.setTransaction)

module.exports = route
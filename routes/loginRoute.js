const express = require("express")
const route = express.Router()
const loginController = require("../controllers/loginController")

route.post("/postLogin", loginController.login)

module.exports = route
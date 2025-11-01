const express = require("express")
const route = express.Router()
const controller = require("../controllers/userController")

route.post("/recordLogin", controller.recordLogin)
route.post("/recordLogout", controller.recordLogout)

module.exports = route
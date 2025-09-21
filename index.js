require("dotenv").config();
const config = require("./config/app_variables")
const express = require("express")
const app = express()

const rateRoute = require("./routes/rateRoutes")
const reportProblemRoute = require("./routes/reportProblemRoute")
const loginRoute = require("./routes/loginRoute")
const transactionRoute = require("./routes/transactionRoute")

app.use(express.json())
app.use(express.urlencoded({extended: true}))

//NOTE: put proper RESPOND STATUS!! <- study different respond status IMPORTANT

app.use("/Rates", rateRoute)

app.use("/Report", reportProblemRoute)

app.use("/Login", loginRoute)

app.use("/transaction", transactionRoute)

app.listen(config.PORT, () => {
    console.log("Listening to port " + config.PORT)
})
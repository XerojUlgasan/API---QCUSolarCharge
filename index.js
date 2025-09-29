require("dotenv").config();
const config = require("./config/app_variables")
const express = require("express")
const app = express()
const cors = require("cors")

const checkActiveDevice = require("./utils/checkActiveDevice")
const checkDeviceAlert = require("./utils/checkDeviceAlerts")

const rateRoute = require("./routes/rateRoutes")
const reportProblemRoute = require("./routes/reportProblemRoute")
const loginRoute = require("./routes/loginRoute")
const transactionRoute = require("./routes/transactionRoute")
const overviewRoute = require("./routes/overviewRoute")
const adminRoute = require("./routes/adminRoute")
const deviceRoute = require("./routes/deviceRoute")
const contactUsRoute = require("./routes/contactUsRoute")

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

//NOTE: put proper RESPOND STATUS!! <- study different respond status IMPORTANT

//TODO: ADD UPDATE DEVICE FOR UPDATING DEVICE DATA /device/update
    //voltage
    //temperature
    //current
    //energy
    //power

app.use("/rates", rateRoute) // /getRates, /postRates
app.use("/report", reportProblemRoute) // /getReports, /postReports
app.use("/contact", contactUsRoute)
app.use("/login", loginRoute) // /postLogin
app.use("/transaction", transactionRoute) // /getTransactions, /postTransactions
app.use("/overview", overviewRoute) // /getOverview
app.use("/admin", adminRoute) // /dashboard /devices /updateReport
app.use("/device", deviceRoute) // /insertEnergy

app.listen(config.PORT, async () => {
    console.log("Listening to port " + config.PORT)

    await checkActiveDevice()
    await checkDeviceAlert()

    setInterval(await checkDeviceAlert, 5000) //WATCHDOG FOR DEVICE ALERTS
    setInterval(await checkActiveDevice, 120000) //WATCHDOG FOR ACTIVE/INACTIVE DEVICE
})

require("dotenv").config();
const config = require("./config/app_variables")
const express = require("express")
const app = express()
const cors = require("cors")

const rateRoute = require("./routes/rateRoutes")
const reportProblemRoute = require("./routes/reportProblemRoute")
const loginRoute = require("./routes/loginRoute")
const transactionRoute = require("./routes/transactionRoute")
const overviewRoute = require("./routes/overviewRoute")
const adminRoute = require("./routes/adminRoute")

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

//NOTE: put proper RESPOND STATUS!! <- study different respond status IMPORTANT

//TODO: admin dashboard 
    //Total energy                  // daily, weekly, monthly, overall
    //total revenue                 // daily, weekly, monthly, overall
    //uses                          // daily, weekly, monthly, overall
    //device status/details     
        //include percentage
    //latest transactions           
    //today's energy accumulated    

    //active devices
    //revenue

    //total reports
    //under investigation
    //resolved
    //critical
    //problems

//TODO: add history for device's generated energy per hour

app.use("/rates", rateRoute) // /getRates, /postRates
app.use("/report", reportProblemRoute) // /getReports, /postReports
app.use("/login", loginRoute) // /postLogin
app.use("/transaction", transactionRoute) // /getTransactions, /postTransactions
app.use("/overview", overviewRoute) // /getOverview
app.use("/admin", adminRoute)

app.listen(config.PORT, () => {
    console.log("Listening to port " + config.PORT)
})
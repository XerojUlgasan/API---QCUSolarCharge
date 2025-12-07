    require("dotenv").config();
    const config = require("./config/app_variables")
    const express = require("express")
    const app = express()
    const cors = require("cors")
    const {Server} = require("socket.io")

    const checkActiveDevice = require("./utils/checkActiveDevice")
    const checkDeviceAlert = require("./utils/checkDeviceAlerts")

    const rateRoute = require("./routes/rateRoutes")
    const reportProblemRoute = require("./routes/reportProblemRoute")
    const loginRoute = require("./routes/loginRoute")
    const transactionRoute = require("./routes/transactionRoute")
    const overviewRoute = require("./routes/overviewRoute")
    const adminRoute = require("./routes/adminRoute")
    const deviceRoute = require("./routes/deviceRoute")
    const contactUsRoute = require("./routes/contactUsRoute");
    const userRoute = require("./routes/userRoute")
    const { createServer } = require("http");
    const initializeSocket = require("./utils/socket/initializeSocket");
    const {initializeListeners, deviceConfListener} = require("./utils/socket/createListeners");
    const { initListener } = require("./utils/supabase/supabasert");

    app.use(cors())
    app.use(express.json())
    app.use(express.urlencoded({extended: true}))

    app.use("/login", loginRoute) 
    app.use("/transaction", transactionRoute)
    app.use("/overview", overviewRoute)
    app.use("/admin", adminRoute)
    app.use("/device", deviceRoute)
    app.use("/user", userRoute)

    

    app.use("/rates", rateRoute) 
    app.use("/report", reportProblemRoute) 
    app.use("/contact", contactUsRoute)

    const server = createServer(app);
    const io = initializeSocket(server)

    server.listen(config.PORT, async () => {
        console.log("Listening to port " + config.PORT)
        console.log("http://localhost:" + config.PORT)

        try {
            initListener(io);
            // initializeListeners(io)
            // deviceConfListener(io)
            // await checkActiveDevice()   
            // setInterval(await checkActiveDevice, 5000) //WATCHDOG FOR ACTIVE/INACTIVE DEVICE
        } catch (e) {
            console.log(e.message)
        }
    })

    
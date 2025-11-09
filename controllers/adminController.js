const {setDoc, doc, getDoc, DocumentReference, collection, getDocs, or, where, query} = require("firebase/firestore")
const db = require("../utils/connectToFirebase")

 
 
exports.getDashboard = async (req, res) => {
    try {
        console.log("Attempting to get admin dashboard.")
        const dashboardData = await require("../utils/getDashboard")()

        return res.status(200).json(dashboardData)
    } catch (e) {
        return res.status(500)        
    }
} 

exports.getDevices = async (req, res) => {
    if(!req.query.device_id){
        res.json({
            message: "Insert device ID in query parameter!"
        })
        return
    }

    try {
        console.log("attempting to get Devices")
        const data = await require("../utils/getDevices")(req.query.device_id)

        return res.status(200).json(data)
    } catch (e) {
        console.log(e.message)
        return res.status(500).json({message: e.message})
    }
}

exports.updateReports = async (req, res) => {
    const reportId = req.body.problem_id
    const statusUpdate = req.body.status_update

    if(!reportId || !statusUpdate){
        res.status(400).json({message: "Requires reportId and statusUpdate"})
        return
    }

    try {
        console.log("Attempting to update reports")
        const reportDoc = await getDoc(doc(db, "reports", reportId))
        const devId = reportDoc.data().location

        const insertAlert = require("../utils/inserAlert")
        const content = "A problem connected with this device has been marked as " + statusUpdate
        const threat = (statusUpdate === "Resolved") ? 0 : 1

        await insertAlert(content, devId, threat)
 
        await setDoc(doc(db, "reports", reportId), {
            status: statusUpdate
        }, {merge: true})

        return res.status(200).json({success: true})
    } catch (e) {
        return res.status(500).json({message: e.message})  
    }
}

exports.updateDevices = async (req, res) => {
    const devId = req.body.device_id 
    const devName = req.body.device_name
    const devLoc = req.body.device_location
    const devBuilding = req.body.device_building

    if(!devId || !devName || !devLoc || !devBuilding){
        return res.status(400).json({message: "Requires device_id, device_name, device_location, and device_building"})
    }

    try {
        console.log("Attempting to update a device")
        await setDoc(doc(db, "devices", devId), {
            name: devName,
            location: devLoc,
            building: devBuilding
        }, {merge: true})   

        return res.status(200).json({success: true})   
    } catch (e) {
        return res.status(500).json({message: e.message})  
    }
}

exports.sendResponseReport = async (req, res) => {

    const {email, 
            device_id, 
            response, 
            building, 
            location} = req.body

    if(!email || !device_id || !response || !building || !location){
        return res.status(400).json({message: "Requires email, device_id, response, building, and location"})
    }

    try {
        console.log("Attempting to send report respose")
        await require("../utils/reportResponseSender")(email, device_id, building, location, response)

        return res.status(200).json({success: true})
    } catch (e) {
        return res.status(500).json({message: e.message})
    }
}

exports.sendResponseContact = async (req, res) => {
    const {id, email, response} = req.body
    const {sendEmail} = require("../utils/emailSender")

    if(!email || !response || !id){
        return res.status(400).json({message: "Requires email, response, and id"})
    }

    try {
        console.log("Attempting to send contact respose")
        await setDoc(doc(db, "contactUs", id), {
            responded: true,
            hasRead: true
        }, {merge: true})
        
        await sendEmail(email, "Response to your inquiry", response)

        return res.status(200).json({success: true})
    } catch (e) {
        return res.status(500).json({message: e.message})
    }
}

exports.deleteDevice = async (req, res) => {
    const {device_id} = req.body

    if(!device_id){
        return res.status(400).json({message: "Requires device_id"})
    }

    try {
        console.log("Attempting to delete a device")
        await require("../utils/deleteDeviceRecords")(device_id)
        return res.status(200).json({success: true})
    } catch (e) {
        return res.status(500).json({message: e.message})
    }
}

exports.getDeviceConfig = async (req, res) => {
    console.log("Attempting to GET /deviceConfig")
    const device_id = req.query.device_id

    if(!device_id){
        return res.status(400).json({message: "Requires device_id"})
    }

    try {
        console.log("Attempting to get config")
        const data = await getDoc(doc(db, "deviceConfig", device_id))
        return res.status(200).json(data.data())
    } catch (e) {
        return res.status(500).json({message: e.message})
    }
}

exports.setDeviceConfig = async (req, res) => {
    const keys = [
        "device_id", //req
        "device_alert_enabled", //opt
        "device_enabled", //opt
        "max_batt", //opt
        "max_temp", //opt
        "min_batt", //opt
        "min_temp", //opt
        "minute_per_peso", //opt
        "samples_per_hour", //opt
        "update_gap_seconds" //opt
    ]

    if(!req.body.device_id){
        return res.status(400).json({message: "Requires device_id"})
    }

    const data = require("../utils/filterObject")(keys, req.body)
    const device_id = req.body.device_id

    try {
        console.log("Attempting to set config")
        await require("../utils/insertDeviceConfig")(data, device_id)
        return res.status(200).json({success: true})
    } catch (e) {
        return res.status(500).json({message: e.message})
    }
}

exports.getAdminInformation = async (req, res) => {
    try {
        console.log("Attempting to get admin info")
        const adminInfo = (await getDoc(doc(db, "superAdmin", await require("../utils/getFirstDocId")("superAdmin")))).data()

        const details = {
            primary_email: adminInfo.email,
            backup_email: adminInfo.backup_email,
            full_name: adminInfo.full_name
        }

        return res.status(200).json(details)
    } catch (e) {
        return res.status(500).json({message: e.message})   
    }
}

exports.setAdminInformation = async (req, res) => {
    const keys = [
        "full_name",
        "primary_email",
        "backup_email"
    ]

    const data = require("../utils/filterObject")(keys, req.body)
    
    const updateObj = {}

    if (data.full_name) updateObj.full_name = data.full_name;
    if (data.primary_email) updateObj.primary_email = data.primary_email.toLowerCase();
    if (data.backup_email) updateObj.backup_email = data.backup_email.toLowerCase(); 
    
    try {
        console.log("Attempting to set admin info")
        // await setDoc(doc(db, "superAdminDetails", "accountInformation"), updateObj, {merge: true})
        await setDoc(doc(db, "superAdmin", await require("../utils/getFirstDocId")("superAdmin")),
                    {
                        email: updateObj.primary_email,
                        backup_email: updateObj.backup_email,
                        full_name: updateObj.full_name
                    }, {merge: true})

        return res.status(200).json({success: true})
    } catch (e) {
        return res.status(500).json({message: e.message})   
    }
}

exports.changeAdminPassword = async (req, res) => {
    const keys = [
        "current_password",
        "new_password"
    ]

    const data = require("../utils/filterObject")(keys, req.body)

    try {
        console.log("Attempting to change admin pass")
        let snap = await (await getDocs(collection(db, "superAdmin"))).docs[0]
        let admin_account = snap.data()

        if(admin_account.password === data.current_password){
            delete admin_account.password
            
            await setDoc(doc(db, "superAdmin", snap.id), 
                        { password: data.new_password}, 
                        {merge: true})

            return res.status(200).json({success: true})
        }else{
            return res.status(401).json({success: false})
        }
    } catch (e) {
        return res.status(500).json({message: e.message})  
    }
}

exports.changeAdminUsername = async (req, res) => {
    const keys = [
        "new_username",
        "current_password"
    ]

    const data = require("../utils/filterObject")(keys, req.body)

    try {
        console.log("Attempting to change admin username")
        let snap = await (await getDocs(collection(db, "superAdmin"))).docs[0]
        let admin_account = snap.data()

        if(admin_account.password === data.current_password){
            delete admin_account.password
            
            await setDoc(doc(db, "superAdmin", snap.id),
                        {username: data.new_username},
                        {merge: true})

            return res.status(200).json({success: true})
        }else{
            return res.status(401).json({success: false})
        }
    } catch (e) {
        return res.status(500).json({message: e.message})  
    }
}

exports.sendOtp = async (req, res) => {
    const keys = ["email"]
    const {sendOTP} = require("../utils/OTPVerification")

    const data = require("../utils/filterObject")(keys, req.body)

    if(!data){
        return res.status(400).json({message: "Invalid request"})
    }

    try {
        console.log("Attempting to send otp")
        const userData = await getDoc(doc(db, "superAdminDetails"))

        if(userData.empty){
            return res.status(200).json({success: false, message: "Invalid email"})    
        }else {
            const hasSent = await sendOTP(userData.full_name, data.email)
            
            return res.status(200).json({success: hasSent})
        }
    } catch (e) {
        return res.status(500).json({message: e.message, error: true})  
    }
}

exports.verifyOtp = async (req, res) => {
    const key = [
        "otp",
        "email"
    ]
    const data = require("../utils/filterObject")(key, req.body)

    if(!data){
        return res.status(400).json({message: "Invalid request"})
    }

    console.log("Attempting to verify otp")
    const {verifyOTP} = require("../utils/OTPVerification")
    
    if(verifyOTP(data.otp, data.email)){ // if the OTP is right
        console.log("Accepted")
        return res.status(200).json({success: true})
    }else{ //If the OTP is wrong
        console.log("Rejected")
        return res.status(200).json({success: false})
    }
}

exports.changePassword = async (req, res) => {
    const keys = [
        "otp",
        "email",
        "new_password"
    ]
    const data = require("../utils/filterObject")(keys, req.body)

    const {changePassword} = require("../utils/OTPVerification")

    try {
        console.log("Attempting to change admin password")
        const result = await changePassword(data.otp, data.new_password, data.email)

        if(result){
            return res.status(200).json({success: true})
        }else{
            return res.status(200).json({success: false})
        }
    } catch (e) {
        return res.status(500).json({message: e.message})
    }
}
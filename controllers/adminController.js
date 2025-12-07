const { messaging } = require("firebase-admin")
const pool = require("../utils/supabase/supabasedb")
const bcrypt = require("bcrypt")

exports.getDashboard = async (req, res) => {
    try {
        console.log("Attempting to get admin dashboard.")
        const dashboardData = await require("../utils/getDashboard")()

        return res.status(200).json(dashboardData)
    } catch (e) {
        console.error("Error getting dashboard:", e)
        return res.status(500).json({ message: e.message })
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
        return res.status(400).json({message: "Requires reportId and statusUpdate"})
    }

    try {
        console.log("Attempting to update reports")
        
        // Get the device_id from the report
        const reportResult = await pool.query(
            'SELECT device_id FROM tbl_reports WHERE report_id = $1',
            [reportId]
        )

        if(reportResult.rows.length === 0){
            return res.status(404).json({message: "Report not found"})
        }

        const devId = reportResult.rows[0].device_id
 
        // Update report status
        await pool.query(
            'UPDATE tbl_reports SET status = $1 WHERE report_id = $2',
            [statusUpdate, reportId]
        )

        return res.status(200).json({success: true})
    } catch (e) {
        console.error("Error updating reports:", e)
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
        await pool.query(
            'UPDATE tbl_devices SET name = $1, location = $2, building = $3 WHERE device_id = $4',
            [devName, devLoc, devBuilding, devId]
        )

        return res.status(200).json({success: true})   
    } catch (e) {
        console.error("Error updating device:", e)
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
        console.log("Attempting to send contact response")
        
        // Update contact as read and responded
        await pool.query(
            'UPDATE tbl_contacts SET responded = true, "hasRead" = true WHERE contact_id = $1',
            [id]
        )
        
        await sendEmail(email, "Response to your inquiry", response)

        return res.status(200).json({success: true})
    } catch (e) {
        console.error("Error sending contact response:", e)
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
        const result = await pool.query(
            'SELECT * FROM tbl_deviceconfig WHERE device_id = $1',
            [device_id]
        )
        
        if(result.rows.length > 0){
            return res.status(200).json(result.rows[0])
        } else {
            // Return default config values
            const defaultConfig = {
                device_id: device_id,
                device_enabled: true,
                max_batt: 100,
                min_batt: 50,
                max_temp: 40,
                min_temp: 20,
                minute_per_peso: 5,
                samples_per_hour: 60,
                update_gap_seconds: 5
            }
            return res.status(200).json(defaultConfig)
        }
    } catch (e) {
        console.error("Error getting device config:", e)
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
        const result = await pool.query('SELECT email, backup_email, full_name FROM tbl_admin LIMIT 1')
        
        if(result.rows.length === 0){
            return res.status(404).json({message: "Admin not found"})
        }

        const adminInfo = result.rows[0]
        const details = {
            primary_email: adminInfo.email,
            backup_email: adminInfo.backup_email,
            full_name: adminInfo.full_name
        }

        return res.status(200).json(details)
    } catch (e) {
        console.error("Error getting admin info:", e)
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
    
    const updateFields = []
    const updateValues = []
    let paramCount = 1

    if (data.full_name) {
        updateFields.push(`full_name = $${paramCount++}`)
        updateValues.push(data.full_name)
    }
    if (data.primary_email) {
        updateFields.push(`email = $${paramCount++}`)
        updateValues.push(data.primary_email.toLowerCase())
    }
    if (data.backup_email) {
        updateFields.push(`backup_email = $${paramCount++}`)
        updateValues.push(data.backup_email.toLowerCase())
    }

    if (updateFields.length === 0) {
        return res.status(400).json({message: "No fields to update"})
    }
    
    try {
        console.log("Attempting to set admin info")
        await pool.query(
            `UPDATE tbl_admin SET ${updateFields.join(', ')} WHERE admin_id = (SELECT admin_id FROM tbl_admin LIMIT 1)`,
            updateValues
        )

        return res.status(200).json({success: true})
    } catch (e) {
        console.error("Error setting admin info:", e)
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
        const result = await pool.query('SELECT admin_id, password FROM tbl_admin LIMIT 1')
        
        if(result.rows.length === 0){
            return res.status(404).json({message: "Admin not found"})
        }

        const admin_account = result.rows[0]

        // Verify current password using bcrypt
        const isPasswordValid = await bcrypt.compare(data.current_password, admin_account.password)

        if(isPasswordValid){
            // Hash new password before saving
            const hashedPassword = await bcrypt.hash(data.new_password, 10)
            
            await pool.query(
                'UPDATE tbl_admin SET password = $1 WHERE admin_id = $2',
                [hashedPassword, admin_account.admin_id]
            )

            return res.status(200).json({success: true})
        }else{
            return res.status(401).json({success: false, message: "Invalid current password"})
        }
    } catch (e) {
        console.error("Error changing password:", e)
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
        const result = await pool.query('SELECT admin_id, password FROM tbl_admin LIMIT 1')
        
        if(result.rows.length === 0){
            return res.status(404).json({message: "Admin not found"})
        }

        const admin_account = result.rows[0]

        // Verify current password using bcrypt
        const isPasswordValid = await bcrypt.compare(data.current_password, admin_account.password)

        if(isPasswordValid){
            await pool.query(
                'UPDATE tbl_admin SET username = $1 WHERE admin_id = $2',
                [data.new_username, admin_account.admin_id]
            )

            return res.status(200).json({success: true})
        }else{
            return res.status(401).json({success: false, message: "Invalid password"})
        }
    } catch (e) {
        console.error("Error changing username:", e)
        return res.status(500).json({message: e.message})  
    }
}

exports.sendOtp = async (req, res) => {
    const keys = ["email"]
    const {sendOTP} = require("../utils/OTPVerification")

    const data = require("../utils/filterObject")(keys, req.body)

    if(!data || !data.email){
        return res.status(400).json({message: "Invalid request"})
    }

    try {
        console.log("Attempting to send otp")
        const result = await pool.query(
            'SELECT email, full_name FROM tbl_admin WHERE email = $1 OR backup_email = $1',
            [data.email.toLowerCase()]
        )

        if(result.rows.length === 0){
            return res.status(200).json({success: false, message: "Invalid email"})    
        } else {
            const hasSent = await sendOTP(result.rows[0].full_name, data.email)
            
            return res.status(200).json({success: hasSent})
        }
    } catch (e) {
        console.error("Error sending OTP:", e)
        return res.status(500).json({message: e.message, error: true})  
    }
}

exports.verifyOtp = async (req, res) => {
    const key = [
        "otp",
        "email"
    ]
    const data = require("../utils/filterObject")(key, req.body)

    if(!data || !data.otp || !data.email){
        return res.status(400).json({message: "Invalid request - OTP and email required"})
    }

    console.log("Attempting to verify otp for:", data.email)
    const {verifyOTP} = require("../utils/OTPVerification")
    
    if(verifyOTP(data.otp, data.email)){ // if the OTP is right
        console.log("OTP Accepted")
        return res.status(200).json({success: true})
    }else{ //If the OTP is wrong
        console.log("OTP Rejected")
        return res.status(400).json({success: false})
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

exports.customQuery = async (req, res) => {
    const query = req.body.query

    if(query === undefined){
        return res.status(400).json({message: "Query is required"})
    }

    try {
        const result = await pool.query(query)
        return res.status(200).json({
            success: true,
            rows: result.rows,
            rowCount: result.rowCount
        })
    } catch (error) {
        console.error("Error executing custom query:", error)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
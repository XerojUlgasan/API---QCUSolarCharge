const NodeCache = require("node-cache")
const OTPCache = new NodeCache()
const bcrypt = require("bcrypt")
const {sendEmail} = require("./emailSender")
const pool = require("./supabase/supabasedb")

if (!OTPCache.get("OTPList")) {
  OTPCache.set("OTPList", { list: [] });
}

const sendOTP = async (full_name, email) => {
    const otp = require("../utils/generateRandomCharacter")(6)

    const OTPList = OTPCache.get("OTPList")
    if (!OTPCache.get("OTPList")) {
        OTPCache.set("OTPList", { list: [] });
    }

    const subject = "Your OTP Code for Password Reset"
    const text = `Hello ${full_name},

You recently requested to reset your password. 
Please use the One-Time Password (OTP) below to proceed with resetting your account:

Your OTP Code: ${otp}

This code will expire in 5 minutes for security reasons. 
If you did not request a password reset, please ignore this email or contact our support team immediately.

Thank you,
QCU - EcoCharge Team`

    const hasSent = await sendEmail(email, subject, text)

    if(hasSent){
        OTPList.list.push({
            email: email.toLowerCase(),
            OTP: otp,
            date_time: Date.now()
        })

        OTPCache.set("OTPList", OTPList)

        console.log(OTPCache.get("OTPList"))
        return true
    }else{
        return false
    }
}

const verifyOTP = (otp, email) => {
    console.log("Verifying OTP:", otp, "for email:", email)
    
    const OTPList = OTPCache.get("OTPList")
    if (!OTPList || !OTPList.list) {
        console.log("No OTP list found")
        return false
    }
    
    if(!otp || !email) {
        console.log("Missing OTP or email")
        return false
    }

    console.log("Current OTP list:", OTPList.list)
    
    const res = OTPList.list.find(entry => entry.OTP === otp && 
                                        entry.email === email.toLowerCase())

    if(!res) {
        console.log("OTP not found or email doesn't match")
        return false
    }

    const curr = Date.now()
    const gapMillis = 5 * 60 * 1000 // 5 mins
    
    if((curr - res.date_time) >= gapMillis){
        console.log("OTP expired")
        return false
    }else{
        console.log("OTP verified successfully")
        return true
    }
}

const changePassword = async (otp, password, email) => {
    const OTPList = OTPCache.get("OTPList")
    if (!OTPList) return false
    if(!otp || !email) return false

    const res = OTPList.list.find(entry => entry.OTP === otp && 
                                        entry.email === email.toLowerCase())

    if(!res) return false

    const curr = Date.now()
    const gapMillis = 5 * 60 * 1000 // 5 mins

    if((curr - res.date_time) >= gapMillis){
        return false
    }else{
        // Get admin from Supabase
        const result = await pool.query('SELECT admin_id FROM tbl_admin LIMIT 1')
        
        if(result.rows.length === 0){
            return false
        }

        // Hash the new password before saving
        const hashedPassword = await bcrypt.hash(password, 10)

        await pool.query(
            'UPDATE tbl_admin SET password = $1 WHERE admin_id = $2',
            [hashedPassword, result.rows[0].admin_id]
        )

        OTPCache.flushAll()
        return true
    }
}

module.exports = {sendOTP, verifyOTP, OTPCache, changePassword}
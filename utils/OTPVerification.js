const NodeCache = require("node-cache")
const OTPCache = new NodeCache()
const {sendEmail} = require("./emailSender")

if (!OTPCache.get("OTPList")) {
  OTPCache.set("OTPList", { list: [] });
}

const sendOTP = async (full_name, email) => {
    const otp = require("../utils/generateRandomCharacter")(6)

    const OTPList = OTPCache.get("OTPList")

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
        console.log(OTPCache.get("OTPList").list)
        return true
    }else{
        return false
    }
}

const verifyOTP = (otp, email) => {
    const OTPList = OTPCache.get("OTPList")
    if (!OTPList) return false
    if(!otp || !email) return false

    const res = OTPList.list.find(entry => entry.OTP === otp && 
                                        entry.email === email.toLowerCase())

    const curr = Date.now()
    const gapMillis = 5 * 60 * 1000 // 5 mins
    
    if((curr - res.date_time) >= gapMillis){
        return false
    }else{
        OTPCache.flushAll()
        return true
    }
}

module.exports = {sendOTP, verifyOTP, OTPCache}
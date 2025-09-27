const respondToReport = async (email, device_id, building, location, response) => {
    const {sendEmail} = require("../utils/emailSender")

    const subject = `Response to your report on device ${device_id}`
    const text = `Dear User,

We have received and reviewed your report regarding the device with the following details:

- Device ID: ${device_id}
- Building: ${building}
- Location: ${location}

Our response to your report:
${response}

If you continue to experience issues or have further concerns, please don’t hesitate to reply to this email or submit another report.

Thank you for helping us improve our services.

Sincerely,  
QCU EcoCharge Support Team
`;

await sendEmail(email, subject, text)

}

module.exports = respondToReport
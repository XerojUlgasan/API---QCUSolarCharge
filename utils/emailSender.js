const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, 
  auth: {
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASS  
  },
});

const sendEmail = async (to, subject, text) => {
    const mailOptions = {
        from: process.env.SMTP_USER, 
        to: to, 
        subject: subject, 
        text: text 
    };

    try {
        await transporter.sendMail(mailOptions);

        console.log("Email sent successfully");
    } catch (error) {

        console.error("Error sending email:", error);
    }
};

module.exports = {sendEmail};
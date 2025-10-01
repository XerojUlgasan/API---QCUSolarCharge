// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
// sgMail.setDataResidency('eu'); 
// uncomment the above line if you are sending mail using a regional EU subuser

const sendEmail = async (to, subject, text) => {
  const msg = {
  to: to, // Change to your recipient
  from: 'QCUEcoCharge@gmail.com', // Change to your verified sender
  subject: subject,
  text: text
}

  try {
    await sgMail.send(msg)
    
    return true
  } catch (e) {
    console.log(e.message)
    throw e
  }
}

module.exports = {sendEmail};


// const nodemailer = require("nodemailer")

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false, 
//   auth: {
//     user: process.env.SMTP_USER, 
//     pass: process.env.SMTP_PASS  
//   },
// });

// const sendEmail = async (to, subject, text) => {
//     const mailOptions = {
//         from: process.env.SMTP_USER, 
//         to: to, 
//         subject: subject, 
//         text: text 
//     };

//     try {
//         await transporter.sendMail(mailOptions);

//         console.log("Email sent successfully");
//     } catch (error) {

//         console.error("Error sending email:", error);
//     }
// };

// module.exports = {sendEmail};

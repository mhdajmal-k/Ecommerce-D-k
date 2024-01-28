const nodemailer=require("nodemailer")


//creating node mailer

const sendMail=async(email,OTP)=>{
try {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: process.env.nodemailer_email,
          pass: process.env.password,
        },
      });
      const mailOption = {
        from: process.env.nodemailer_email,
        to: email,
        subject: "OTP Verification",
        text: `Your OTP for Verification is ${OTP}`,
      };
      transporter.sendMail(mailOption, (error, info) => {
        if (error) {
          console.error("Mailing error", error);
        } else {
          console.log("Email sent: " + info.response);
        
        }
      });
} catch (error) {
console.log(error.message)    
}
}
 

module.exports={sendMail}
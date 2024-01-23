const user = require("../model/user_model");
const bcrypt = require("bcrypt");
const nodemailer=require("nodemailer")





//secure Password

const securePassword=async(password)=>{
  try {
    
    const hashPassword=await bcrypt.hash(password, 10);
    return hashPassword
  } catch (error) {
    console.log(error.message)
  }
}

//generate OTP
const generateOTP = (length) => {
  let otp = '';

  for (let i = 0; i < length; i++) {
      const digit = Math.floor(Math.random() * 10);
      otp += digit.toString(); 
  }

  return otp;
};



//Home page

const landing_page = async (req, res) => {
  try {
    res.render("landing_page");
  } catch (error) {
    console.log(error.message);
  }
};

//Login page
const load_login = async (req, res) => {
  try {
    res.render("login_page");
  } catch (error) {
    console.log(error.message);
  }
};




//signup page
const load_signup = async (req, res) => {
  try {
    res.render("signup");
  } catch (error) {
    console.log(error.message);
  }
};


//submit_signup
const submit_signup=async(req,res)=>{
    try {
    
      const {email,username,mobile,password}=req.body
      //checking existing Email
  
      const existingEmail=await user.findOne({email})

      //checking existing mobile
      const  existingMobile=await user.findOne({mobile})

      if(existingEmail&&existingMobile){
        res.render("signup",{message:"User Already Existing..."})
      }
      else{
      console.log(password)
      const securedPassword=await securePassword(password)
      const user_data= {email,username,mobile,securedPassword}
      req.session.user=user_data
      req.session.user=email
      const OTP=await generateOTP(6)
      console.log(OTP)

      //creating node mailer
      const transporter=nodemailer.createTransport({
        service:"gmail",
        port:587,
        secure:false,
        requireTLS:true,
        auth:{
          user:process.env.nodemailer_email,
          pass:process.env.password
        }
      });
      const mailOption = {
        from: process.env.nodemailer_email,
        to: email,
        subject: "OTP Verification",
        text: `Your OTP for Verification is ${OTP}`
    }
    transporter.sendMail(mailOption, (error,info)=>{

      if(error){
          console.error("Mailing error",error);
      }else{
          console.log('Email sent: ' + info.response);
          res.redirect("/otp_verification")
      }

  })
 


      }





    } catch (error) {
        console.log(error.message)
    }
}


const otp_verification = async (req, res) => {
  try {
    res.render("otp_page");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  landing_page,
  load_login,
  load_signup,
  submit_signup,
  otp_verification,
};

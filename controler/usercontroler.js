const user = require("../model/user_model");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { render } = require("../router/user_routers");

//secure Password

const securePassword = async (password) => {
  try {
    const hashPassword = await bcrypt.hash(password, 10);
    return hashPassword;
  } catch (error) {
    console.log(error.message);
  }
};

//generate OTP
const generateOTP = (length) => {
  let otp = "";

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
const submit_signup = async (req, res) => {
  try {
    const { email, username, mobile, password } = req.body;
    //checking existing Email

    const existingEmail = await user.findOne({ email });

    //checking existing mobile
    const existingMobile = await user.findOne({ mobile });

    if (existingEmail && existingMobile) {
      res.render("signup", { message: "User Already Existing..." });
    } else {
      console.log(password);
      const securedPassword = await securePassword(password);
      const user_data = { email, username, mobile, securedPassword };
      req.session.user = user_data;
      // req.session.email=email
      console.log("chekilng" + req.session.user.email);
      const OTP = await generateOTP(6);
      req.session.OTP = OTP;
      console.log(OTP);

      //creating node mailer
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
          res.redirect("/otp_verification");
        }
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//load otp
const otp_verification = async (req, res) => {
  try {
    res.render("otp_page");
  } catch (error) {
    console.log(error.message);
  }
};

//otp checking...
const otp_submit = async (req, res) => {
  try {
    const { otp } = req.body;
    console.log(`otp ${otp}`);
    console.log(`session ${req.session.OTP}`);

    if (otp !== req.session.OTP) {
      res.render("otp_page", { message: "Entered OTP is INVALID!" });
    } else {
      const { email, securedPassword, mobile, username } = req.session.user;
      const saving_data = new user({
        username: username,
        email: email,
        mobile: mobile,
        password: securedPassword,
        is_verified: 1,
      });
      const userData = await saving_data.save(); 
      delete req.session.OTP;

      if (userData) {
        res.redirect("/login");
      } else {
        console.log("error");
        res.status(400).json("user data fail");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

//user login

const verify_login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user_email = await user.findOne({ email: email });
    console.log(user_email + "cking user emali");

    if (user_email) {
      const passwordMatch = await bcrypt.compare(password, user_email.password);
      if (passwordMatch) {
        if (user_email.is_verified == 1) {
          console.log(user_email._id);
          req.session.id = user_email._id.toString();
          console.log("its a sessin id" + req.session.id);
          res.redirect("/");
        } else {
          res.render("login_page", { message: "Please Verify email" });
        }
      } else {
        res.render("login_page", { message: "Invalid Password" });
      }
    } else {
      res.render("login_page", { message: "Invalid Email and password" });
    }
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
  otp_submit,
  verify_login,
};

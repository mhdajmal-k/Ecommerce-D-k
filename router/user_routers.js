const express = require("express");
const user_router = express();
const userController = require("../controler/usercontroler");
const path = require("path");
const { isLogin, isLogout } = require("../middleware/userAuth");




//=============================user controller
const {
  load_login,
  landing_page,
  load_signup,
  submit_signup,
  otp_verification,
  otp_submit,
  resendOtp,
  verify_login,
  load_shop,
  shopProduct,
  logout,
  load_forgotPassword,
  forgotPassword,
  verify_forgotPassword,
  resetPassword,
  load_profile
} = userController;

//=============================





user_router.set("view engine", "ejs");
user_router.set("views", "./views/user");

user_router.get("/",landing_page);
user_router.get("/login", isLogout, load_login);
user_router.get("/signup", isLogout,load_signup);
user_router.post("/signup", isLogout, submit_signup);
user_router.get("/otp_verification", isLogout,otp_verification);
user_router.post("/otp_verification", isLogout, otp_submit);
user_router.get("/resendOtp", isLogout,resendOtp);
user_router.post("/login",verify_login);
user_router.get("/shop",load_shop);
user_router.get("/shopProduct",shopProduct);
user_router.get("/logout", logout);
user_router.get("/forgotPassword", load_forgotPassword);
user_router.post("/forgotPassword", forgotPassword);
user_router.get("/forgotPassword_verify", verify_forgotPassword);
user_router.post("/forgotPassword_verify", resetPassword);
user_router.get("/profile",load_profile);

module.exports = user_router;

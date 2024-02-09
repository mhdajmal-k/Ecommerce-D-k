const express = require("express");
const  passport=require("../passport")
const user_router = express();
const userController = require("../controler/usercontroler");
const profileController=require("../controler/userprofilecontrler")
const path = require("path");
const { isLogin, isLogout,isBlocked} = require("../middleware/userAuth");


// isBlocked()
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

} = userController;

//=============================


const {load_profile,load_addAddress,addAddress,load_editAddress,editAddress,load_editProfile}=profileController





user_router.set("view engine", "ejs");
user_router.set("views", "./views/user");

user_router.get("/",isBlocked,landing_page);
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
user_router.get("/forgotPassword", isLogout, load_forgotPassword);
user_router.post("/forgotPassword", isLogout, forgotPassword);
user_router.get("/forgotPassword_verify", isLogout, verify_forgotPassword);
user_router.post("/forgotPassword_verify", isLogout, resetPassword);


// user_router.get('/auth/google', 
//   passport.authenticate("google", { scope : ['profile', 'email'] }))
   
// user_router.get('/auth/google/callback', 
// passport.authenticate('google', { failureRedirect: '/login' }),
// function(req, res) {
//   res.redirect('/');
// });



//////////////user profile///////////////////


user_router.get("/profile",isLogin,load_profile)
user_router.get("/addAddress",isBlocked,isLogin,load_addAddress)
user_router.post("/addAddress",isBlocked,isLogin,addAddress)
user_router.get("/addressEdit",isBlocked,isLogin,load_editAddress)
user_router.post("/addressEdit",isBlocked,isLogin,editAddress)
user_router.get("/editProfile",isBlocked,isLogin,load_editProfile)






;

module.exports = user_router;

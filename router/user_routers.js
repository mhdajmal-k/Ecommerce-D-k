
const express = require("express");
const  passport=require("../passport")
const user_router = express();
const userController = require("../controler/usercontroler");
const profileController=require("../controler/userprofilecontrler")
const path = require("path");
const { isLogin, isLogout,isBlocked} = require("../middleware/userAuth");
const cartController=require("../controler/cartcontroler")
const orderController=require("../controler/ordercontroler")


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
  lowtohigh,
  highToLow,
  newArrival,
  shopProduct,
  logout,
  load_forgotPassword,
  forgotPassword,
  verify_forgotPassword,
  resetPassword,
  browsCategory,
  accedingOrder,
  descendingOrder

} = userController;

//=============================


const {load_profile,load_addAddress,addAddress,load_editAddress,editAddress,load_editProfile,editProfile,changePassword,load_order}=profileController
const {load_cart,addCart,removeItem,decrementQuantity}=cartController
const {load_checkout,place_Order,load_orderSuccess,viewOrderDeatails,cancelOrder}=orderController





user_router.set("view engine", "ejs");
user_router.set("views", "./views/user");

user_router.get("/",isBlocked,landing_page)
.get("/login", isLogout, load_login)
.get("/signup", isLogout,load_signup)
.post("/signup", isLogout, submit_signup)
.get("/otp_verification", isLogout,otp_verification)
.post("/otp_verification", isLogout, otp_submit)
.get("/resendOtp", isLogout,resendOtp)
.post("/login",verify_login)
.get("/shop",load_shop)
.get("/lowtohigh",lowtohigh)
.get("/highToLow",highToLow)
.get("/newArrival",newArrival)
.get("/shopProduct",shopProduct)
.get("/logout", logout)
.get("/forgotPassword", isLogout, load_forgotPassword)
.post("/forgotPassword", isLogout, forgotPassword)
.get("/forgotPassword_verify", isLogout, verify_forgotPassword)
.post("/forgotPassword_verify", isLogout, resetPassword)
.get('/browse',isBlocked,browsCategory)
.get("/accedingOrder",isBlocked,accedingOrder)
.get("/descendingOrder",isBlocked,descendingOrder)


// user_router.get('/auth/google', 
//   passport.authenticate("google", { scope : ['profile', 'email'] }))
   
// user_router.get('/auth/google/callback', 
// passport.authenticate('google', { failureRedirect: '/login' }),
// function(req, res) {
//   res.redirect('/');
// });



//////////////user profile///////////////////





user_router
.get("/profile",isLogin,load_profile)
.get("/addAddress", isBlocked, isLogin, load_addAddress)
.post("/addAddress", isBlocked, isLogin, addAddress)
.get("/addressEdit", isBlocked, isLogin, load_editAddress)
.post("/addressEdit", isBlocked, isLogin, editAddress)
.get("/editProfile", isBlocked, isLogin, load_editProfile)
.post("/editProfile", isLogin, editProfile)
.post("/resetPassword", isLogin, changePassword)
.get('/order',isBlocked,isLogin,load_order)



//////////////////// cart ///////////////


user_router
.get("/cart",isLogin,load_cart)
.post("/cart",addCart)
.get("/removeItem",removeItem)
.post("/decrementQuantity",decrementQuantity)


///////////////order //////////////

user_router
.get('/checkOut',isBlocked,isLogin,load_checkout)
.post('/placeOrder',isBlocked,isLogin,place_Order)
.get('/orderSuccess',isBlocked,isLogin,load_orderSuccess)
.get('/viewOrderDeatails',isBlocked,isLogin,viewOrderDeatails)
.post('/cancelOrder',isBlocked,isLogin,cancelOrder)






module.exports = user_router;

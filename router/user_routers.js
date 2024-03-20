
const express = require("express");
const  passport=require("../passport")
const user_router = express();
const userController = require("../controler/usercontroler");
const profileController=require("../controler/userprofilecontrler")
const path = require("path");
const { isLogin, isLogout,isBlocked} = require("../middleware/userAuth");
const cartController=require("../controler/cartcontroler")
const orderController=require("../controler/ordercontroler")
const wallet_control=require("../controler/wallet_control")



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
  descendingOrder,
  Load_WishList,
  submitReview,
  removeReview,
  add_ToWishlist,
  removeFromWishList,
  averageRating,
  searchProduct
} = userController;

//=============================


const {
  load_profile,
  load_addAddress,
  addAddress,
  load_editAddress,
  addressDelete,
  editAddress,
  load_editProfile,
  editProfile,
  changePassword,
  load_order,
  load_coupons
  }=profileController

const {load_cart,addCart,removeItem,changeQuantity}=cartController

const {
  load_checkout,
  place_Order,
  load_orderSuccess,
  viewOrderDeatails,
  cancelOneProduct,
  cancelOrder,
  razorPaymentVerify,
  applycoupon,
  returnRequest,
  generatePdf
}=orderController





const {
  load_wallet,
  addToWallet,
  walletRazorPayVerify
}=wallet_control


user_router.set("view engine", "ejs");
user_router.set("views", "./views/user");
   


//==================================  user controller================================


user_router.get("/",isBlocked,landing_page)
.get("/login",isBlocked, isLogout, load_login)
.get("/signup",isBlocked, isLogout,load_signup)
.post("/signup",isBlocked, isLogout, submit_signup)
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
.get("/wishList",isBlocked,isLogin,Load_WishList)
.post("/addToWishlist",isBlocked,add_ToWishlist)
.post("/submitReview",isBlocked,submitReview)
.post("/removeReview",isBlocked,removeReview)
.post("/removeFromWishList",isBlocked,removeFromWishList)
.get("/averageRating",isBlocked,averageRating)
.post("/searchProducts",isBlocked,searchProduct)


// user_router.get('/auth/google', 
//   passport.authenticate("google", { scope : ['profile', 'email'] }))
   
// user_router.get('/auth/google/callback', 
// passport.authenticate('google', { failureRedirect: '/login' }),
// function(req, res) {
//   res.redirect('/');
// });







//==================================  userprofile controller================================


user_router
.get("/profile",isLogin,load_profile)
.get("/addAddress", isBlocked, isLogin, load_addAddress)
.post("/addAddress", isBlocked, isLogin, addAddress)
.get("/addressEdit", isBlocked, isLogin, load_editAddress)
.post("/addressEdit", isBlocked, isLogin, editAddress)
.post("/addressDelete", isBlocked, isLogin, addressDelete)
.get("/editProfile", isBlocked, isLogin, load_editProfile)
.post("/editProfile", isBlocked,isLogin, editProfile)
.post("/resetPassword",isBlocked, isLogin, changePassword)
.get('/order',isBlocked,isLogin,load_order)
.get("/coupons",isBlocked,isLogin,load_coupons)




//==================================  cart controller================================

user_router
.get("/cart",isBlocked,isLogin,load_cart)
.post("/cart",isBlocked,isLogin,addCart)
.get("/removeItem",isBlocked,isLogin,removeItem)
.post("/decrementQuantity",isBlocked,isLogin,changeQuantity)

//==================================  order controller================================

user_router
.get('/checkOut',isBlocked,isLogin,load_checkout)
.post('/placeOrder',isBlocked,isLogin,place_Order)
.get('/orderSuccess',isBlocked,isLogin,load_orderSuccess)
.get('/viewOrderDeatails',isBlocked,isLogin,viewOrderDeatails)
.post('/cancelOrder',isBlocked,isLogin,cancelOrder)
.post('/cancelOneProduct',isBlocked,isLogin,cancelOneProduct)
.post('/razorPayVerify',razorPaymentVerify)
.post("/applycoupon",isBlocked,isLogin,applycoupon)
.post("/return-request",isBlocked,isLogin,returnRequest)
.get("/generate-invoice",isBlocked,isLogin,generatePdf)

//==================================  wallet controller================================

user_router
.get("/wallet",isBlocked,isLogin,load_wallet)
.post("/addToWallet",isBlocked,isLogin,addToWallet)
.post("/walletRazorPayVerify",walletRazorPayVerify)






module.exports = user_router;

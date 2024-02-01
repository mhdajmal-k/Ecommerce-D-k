const express=require("express")
const user_router=express()
const userController=require("../controler/usercontroler")
const path=require("path")







user_router.set("view engine","ejs")
user_router.set("views",'./views/user')


user_router.get('/',userController.landing_page)
user_router.get('/login',userController.load_login)
user_router.get('/signup',userController.load_signup)
user_router.post('/signup',userController. submit_signup)
user_router.get('/otp_verification',userController.otp_verification)
user_router.post('/otp_verification',userController.otp_submit)
user_router.post('/login',userController.verify_login)
user_router.get('/shop',userController.load_shop)
user_router.get('/shopProduct',userController.shopProduct)

module.exports=user_router
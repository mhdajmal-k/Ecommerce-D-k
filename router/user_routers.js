const express=require("express")
const user_router=express()
const userController=require("../controler/usercontroler")
const path=require("path")
// const session=require("express session")

user_router.set("view engine","ejs")
user_router.set("views",'./views/user')


user_router.get('/',userController.landing_page)
user_router.get('/login',userController.load_login)
user_router.get('/singup',userController.load_singup)
user_router.post('/otp_verification',userController.otp_verification)


module.exports=user_router
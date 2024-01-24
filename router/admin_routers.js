const express=require("express")
const admin_router=express()
const admin_controller=require('../controler/admincontroler')
const path=require("path")

admin_router.set("view engine","ejs")
admin_router.set("views",'./views/admin')




admin_router.get("/",admin_controller.login_load)
admin_router.post("/",admin_controller.verify_login)
admin_router.get("/dashboard",admin_controller. Dashboard_load)
admin_router.get("/userLoad",admin_controller.userLoad)


module.exports=admin_router
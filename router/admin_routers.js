const express=require("express")
const admin_router=express()
const admin_controller=require('../controler/admincontroler')
const path=require("path")

admin_router.set("view engine","ejs")
admin_router.set("views",'./views/admin')



admin_router.get("/",admin_controller.admin_dashboard)
admin_router.get("/product_list",admin_controller.load_product)

module.exports=admin_router
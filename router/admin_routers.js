const express=require("express")
const admin_router=express()
const admin_controller=require('../controler/admincontroler')
const category_controller=require('../controler/categorycontrol')


const path=require("path")
const Auth = require('../middleware/adminAuth');

admin_router.set("view engine","ejs")
admin_router.set("views",'./views/admin')




admin_router.get("/",admin_controller.login_load)
admin_router.post("/",admin_controller.verify_login)
admin_router.get("/dashboard",Auth.sessionChecker,admin_controller.Dashboard_load);
admin_router.get("/userLoad",admin_controller.userLoad)
admin_router.post('/block_user',admin_controller.userBlockUnblock)










admin_router.get('/addproduct',admin_controller.add_Product)



admin_router.get('/category',category_controller.load_category)
admin_router.get('/addcategory',category_controller.load_Addcategory)
admin_router.post('/addcategory',category_controller.addCategory )
admin_router.get('/updateCategory',category_controller.load_editCategory)
admin_router.post('/updateCategory',category_controller.editCategory)








module.exports=admin_router
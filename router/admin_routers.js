const express=require("express")
const admin_router=express()
const admin_controller=require('../controler/admincontroler')
const category_controller=require('../controler/categorycontrol')
const product_controller=require('../controler/prodctcontoler')
const upload=require('../controler/helper/multer')





const path=require("path")
const Auth = require('../middleware/adminAuth');

admin_router.set("view engine","ejs")
admin_router.set("views",'./views/admin')



//==================================  admin controller================================



admin_router.get("/",admin_controller.login_load)
admin_router.post("/",admin_controller.verify_login)
admin_router.get("/dashboard",Auth.sessionChecker,admin_controller.Dashboard_load);
admin_router.get("/userLoad",admin_controller.userLoad)
admin_router.post('/block_user',admin_controller.userBlockUnblock)

//==================================  admin controller================================








//==================================  product controller================================

admin_router.get('/products',product_controller. load_products)
admin_router.get('/addproduct',product_controller. add_ProductLoad)
admin_router.post('/addproduct',upload.array('images', 5),product_controller.add_Product)
admin_router.get('/editProduct',product_controller.load_editProduct)
admin_router.post('/editProduct',product_controller.editProduct)
admin_router.post('/productListAndUnList',product_controller.listAndUnList)




//==================================  product controller================================




















//==================================  category controller================================

admin_router.get('/category',category_controller.load_category)
admin_router.get('/addcategory',category_controller.load_Addcategory)
admin_router.post('/addcategory',category_controller.addCategory )
admin_router.get('/updateCategory',category_controller.load_editCategory)
admin_router.post('/updateCategory',category_controller.editCategory)
admin_router.get('/block_user',category_controller.listAndUnList)


//==================================  category controller================================







module.exports=admin_router
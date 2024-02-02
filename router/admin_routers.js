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
admin_router.get("/userLoad",Auth.sessionChecker,admin_controller.userLoad)
admin_router.post('/block_user',Auth.sessionChecker,admin_controller.userBlockUnblock)
admin_router.get('/logout',admin_controller.logout)

//==================================  admin controller================================



//==================================  product controller================================

admin_router.get('/products',Auth.sessionChecker,product_controller. load_products)
admin_router.get('/addproduct',Auth.sessionChecker,product_controller. add_ProductLoad)
admin_router.post('/addproduct',Auth.sessionChecker,upload.array('images', 5),product_controller.add_Product)
admin_router.get('/editProduct',Auth.sessionChecker,product_controller.load_editProduct)
admin_router.post('/editProduct',Auth.sessionChecker,product_controller.editProduct)
admin_router.post('/productListAndUnList',Auth.sessionChecker,product_controller.listAndUnList)
admin_router.get('/blockProducts/:id',Auth.sessionChecker,product_controller.delete_product)

//==================================  product controller================================



//==================================  category controller================================

admin_router.get('/category',Auth.sessionChecker,category_controller.load_category)
admin_router.get('/addcategory',Auth.sessionChecker,category_controller.load_Addcategory)
admin_router.post('/addcategory',Auth.sessionChecker,category_controller.addCategory )
admin_router.get('/updateCategory',Auth.sessionChecker,category_controller.load_editCategory)
admin_router.post('/updateCategory',Auth.sessionChecker,category_controller.editCategory)
admin_router.get('/block_user',Auth.sessionChecker,category_controller.listAndUnList)


//==================================  category controller================================







module.exports=admin_router
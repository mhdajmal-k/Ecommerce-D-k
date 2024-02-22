
const express=require("express")
const admin_router=express()
const admin_controller=require('../controler/admincontroler')
const category_controller=require('../controler/categorycontrol')
const product_controller=require('../controler/prodctcontoler')
const upload=require('../controler/helper/multer')
const adminOrderController=require("../controler/adminOrderController")




const{login_load,
verify_login,
Dashboard_load,
userLoad,
userBlockUnblock,
logout}=admin_controller


const {load_products,add_ProductLoad,add_Product,load_editProduct,delete_product,listAndUnListProduct,editProduct,delete_image}=product_controller



const {load_category,load_Addcategory,addCategory,load_editCategory,editCategory,listAndUnList}=category_controller

const {load_orders}=adminOrderController




const path=require("path")
const Auth = require('../middleware/adminAuth');

admin_router.set("view engine","ejs")
admin_router.set("views",'./views/admin')



//==================================  admin controller================================



admin_router.get("/",login_load)
admin_router.post("/",verify_login)
admin_router.get("/dashboard",Auth.sessionChecker,Dashboard_load);
admin_router.get("/userLoad",Auth.sessionChecker,userLoad)
admin_router.post('/block_user',Auth.sessionChecker,userBlockUnblock)
admin_router.get('/logout',logout)

//==================================  admin controller================================



//==================================  product controller================================

admin_router.get('/products',Auth.sessionChecker, load_products)
admin_router.get('/addproduct',Auth.sessionChecker, add_ProductLoad)
admin_router.post('/addproduct',Auth.sessionChecker,upload.array('images', 5),add_Product)
admin_router.get('/editProduct',Auth.sessionChecker,load_editProduct)
admin_router.post('/editProduct',Auth.sessionChecker,upload.array('images', 5),editProduct)
admin_router.post('/productListAndUnList',Auth.sessionChecker,listAndUnListProduct)
admin_router.get('/blockProducts/:id',Auth.sessionChecker,delete_product)
admin_router.post('/deleteImage',Auth.sessionChecker,delete_image)

//==================================  product controller================================



//==================================  category controller================================

admin_router.get('/category',Auth.sessionChecker,load_category)
admin_router.get('/addcategory',Auth.sessionChecker,load_Addcategory)
admin_router.post('/addcategory',Auth.sessionChecker,addCategory )
admin_router.get('/updateCategory',Auth.sessionChecker,load_editCategory)
admin_router.post('/updateCategory',Auth.sessionChecker,editCategory)
admin_router.get('/block_user',Auth.sessionChecker,listAndUnList)


//==================================  Order controller================================


admin_router.get("/listOrders",Auth.sessionChecker,load_orders)




module.exports=admin_router
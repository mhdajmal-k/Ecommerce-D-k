const express = require("express");
const admin_router = express();
const admin_controller = require("../controler/admincontroler");
const category_controller = require("../controler/categorycontrol");
const product_controller = require("../controler/prodctcontoler");
const upload = require("../controler/helper/multer");
const adminOrderController = require("../controler/adminOrderController");
const couponController = require("../controler/coupon_controler");

/////////////////////admin Controllers/////////////////////////

const {
  login_load,
  verify_login,
  Dashboard_load,
  userLoad,
  userBlockUnblock,
  logout,
  load_saleReport,
  sortSalesReport,
  load_review,
  notificationViewed,
  loadChart,

 
} = admin_controller;

//////////////////////////////////////////////////////



/////////////////Product Controller////////////////////////

 const {
  load_products,
  add_ProductLoad,
  add_Product,
  load_editProduct,
  delete_product,
  listAndUnListProduct,
  editProduct,
  delete_image,
  productOffer,
  addingOffer,
  categoryOffer,
  applyCategoryOffer
  
} = product_controller;


//////////////////////////////////////////

 
////////////////// category Controllers///////////////
const {
  load_category,
  load_Addcategory,
  addCategory,
  load_editCategory,
  editCategory,
  listAndUnList,
} = category_controller;

/////////////////////////////////////

//////////// Admin OrderControllers/////////////////////////

const {
     load_orders, 
    load_ordersDetails,
     changeOrderStatus
     } =
  adminOrderController;

/////////////////////////////////////

  ///////////////////////// Coupon Controllers/////////////////
const {
  load_coupon,
  addCoupons,
  CreateCoupons,
  load_couponEdit,
  editCoupon,
  delete_coupon,
  statusChange,
} = couponController;
////////////////////////////////////////////////

const path = require("path");
const Auth = require("../middleware/adminAuth");
const { sessionChecker } = Auth;

admin_router.set("view engine", "ejs");
admin_router.set("views", "./views/admin");

//==================================  admin controller================================

admin_router
  .get("/", login_load)
  .post("/", verify_login)
  .get("/dashboard", sessionChecker, Dashboard_load)
  .post("/dashboard",sessionChecker,loadChart)
  .get("/userLoad", sessionChecker, userLoad)
  .post("/block_user", sessionChecker, userBlockUnblock)
  .get("/salereport", sessionChecker, load_saleReport)
  .get("/sortSalesReport", sessionChecker, sortSalesReport)
  .get("/Reviews",sessionChecker,load_review)
  .post("/notificationViewed",sessionChecker,notificationViewed)
  .get("/logout", logout)

//==================================  product admin controller================================

//==================================  product controller================================

admin_router
  .get("/products", sessionChecker, load_products)
  .get("/addproduct", sessionChecker, add_ProductLoad)
  .post("/addproduct", sessionChecker, upload.array("images", 5), add_Product)
  .get("/editProduct", sessionChecker, load_editProduct)
  .post("/editProduct", sessionChecker, upload.array("images", 5), editProduct)
  .post("/productListAndUnList", sessionChecker, listAndUnListProduct)
  .get("/blockProducts/:id", sessionChecker, delete_product)
  .post("/deleteImage", sessionChecker, delete_image)
  .get("/product-Offer",sessionChecker,productOffer)
  .post("/product-Offer",sessionChecker,addingOffer)
  .get("/category-Offer",sessionChecker,categoryOffer)
  .post("/applyCategoryOffer",sessionChecker,applyCategoryOffer)



//==================================  product controller================================

//==================================  category controller================================

admin_router
  .get("/category", sessionChecker, load_category)
  .get("/addcategory", sessionChecker, load_Addcategory)
  .post("/addcategory", sessionChecker, addCategory)
  .get("/updateCategory", sessionChecker, load_editCategory)
  .post("/updateCategory", sessionChecker, editCategory)
  .get("/block_user", sessionChecker, listAndUnList);

//==================================  Order controller================================

admin_router
  .get("/listOrders", sessionChecker, load_orders)
  .get("/orderDetails", sessionChecker, load_ordersDetails)
  .post("/updateOrderStatus", sessionChecker, changeOrderStatus);

//==================================  coupon controller================================
admin_router
  .get("/coupon", sessionChecker, load_coupon)
  .get("/addCoupon", sessionChecker, addCoupons)
  .post("/add-coupon", sessionChecker, CreateCoupons)
  .get("/coupon-edit", sessionChecker, load_couponEdit)
  .post("/edit-coupon", sessionChecker, editCoupon)
  .delete("/delete-coupon", sessionChecker, delete_coupon)
  .post("/coupon-listAndUnList", sessionChecker, statusChange);

module.exports = admin_router;

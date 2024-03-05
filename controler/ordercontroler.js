"use strict";

const cart = require("../model/cart_model");
const address = require("../model/address_model");
const User = require("../model/user_model");
const Product = require("../model/product_model");
const coupon=require("../model/coupon")
const generateOrderNumber = require("./helper/orderId");
const Order = require("../model/order_model");
const Razorpay = require("razorpay");
const crypto=require("crypto")
// const order = require("../model/order_model");
const razorpayInstance = new Razorpay({
  key_id: process.env.RazorPayId,
  key_secret: process.env.RazorPaySecret,
});

//check out page

const load_checkout = async (req, res) => {
  try {
    const user = req.session.userId;
    const userCart = await cart.findOne({ userId: user }).populate({
      path: "items.productId",
      populate: {
        path: "categoryId",
        model: "categories",
      },
    });

    const items = userCart.items.length;
    const userCartTOtal=userCart.total
    console.log(userCartTOtal,"its total");
    console.log( typeof userCartTOtal,"its total");
    if (items > 0) {
      const userAddress = await address.find({ user: user });
      const coupons = await coupon.find({
        $and: [
          { listed: true },
          { user: { $nin: [user] } },
          { minimumPrice: { $lte: parseFloat(userCartTOtal) } }
        ]
      });
      console.log(coupons,"its coupkon");
      res.render("checkout", {
        userCart: userCart,
        userAddress: userAddress,
        user: user,
        coupons:coupons
      });
    } else {
      res.redirect("/cart");
    }
  } catch (error) {
    console.error(error.message);
  }
};

//place order

const place_Order = async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId);
    const { cartId, addressId, paymentOption } = req.body;
    const cartIdforPassing=cartId
    const userCart = await cart
      .findById({ _id: cartId })
      .populate("items.productId");
    for (let i = 0; i < userCart.items.length; i++) {
      const cartItem = userCart.items[i];
      const product = cartItem.productId;
      if (!product) {
        return res.json({ status: "invalid product" });
      }
      if (product.isBlocked) {
        return res.json({ status: "blocked product" });
      }
      const sizeCheck = product.size.find((size) => {
        return size.size === cartItem.size;
      });
      if (!sizeCheck || sizeCheck.quantity < cartItem.quantity) {
        return res.json({ status: "out of stock" });
      }
    }
    const orderProducts = userCart.items.map((cartProduct) => ({
      product: cartProduct.productId._id,
      quantity: cartProduct.quantity,
      price: cartProduct.subTotal,
      size: cartProduct.size,
    }));

    const userAddress = await address.findById(addressId);
    const orderNumber = generateOrderNumber();
    const order = {
      userId: user._id,
      orderNumber: orderNumber,
      items: orderProducts,
      totalAmount: userCart.total,
      shippingAddress: {
        address: userAddress.address,
        pinCode: userAddress.pinCode,
        state: userAddress.state,
        locality: userAddress.locality,
        landmark: userAddress.landmark,
        mobile: user.mobile,
        alternatePhone: userAddress.alternatePhone,
        district: userAddress.district,
      },
      payment: paymentOption,
    };

    const createOrder = await Order.create(order);

    

    if (paymentOption === "cod") {
      console.log(("inside the cod"));
      await cart.findByIdAndDelete({ _id: cartId });
      

    for (const orderedProduct of createOrder.items) {
      const orderedProductId = orderedProduct.product;
      const orderedQuantity = orderedProduct.quantity;
      const orderedProductSize = orderedProduct.size;
      const product = await Product.findById(orderedProductId);
      console.log(product,"its prodcuct");

      const updatedSizes = product.size.map((size) => {
        if (size.size === orderedProductSize) {
          size.quantity -= orderedQuantity;
        }
        return size;
      });

      product.size = updatedSizes;
      await product.save();
    }

      res.json({ status: "order placed" });
      return;
    }
    if (paymentOption === "razorPay") {
 

    const generateRazor=await generateRazorPay(createOrder.totalAmount,createOrder.orderNumber)
    console.log(generateRazor);
    res.json({status:"razorPay",generateRazor,user,userOrder:createOrder,cartIdforPassing})
    }
  } catch (error) {
    console.log(error.message);
    return res.json({ status: "error", message: error.message });
  }
};




function generateRazorPay(orderAmount,orderId){
  console.log(typeof orderAmount)
  console.log(typeof orderId,"its orderId ")
  return new Promise((resolve,reject)=>{
    const options = {
      amount:parseInt(orderAmount)*100,
      currency: "INR",
      receipt:orderId.toString() ,
    };
     console.log(options);
    razorpayInstance.orders.create(options, (err, order) => {
      if(err){
        console.log(err)
      }else{
        
        console.log(order, "its order");
        resolve(order)
      }
    })
     
  })
   
}

const razorPaymentVerify=async(req,res)=>{
  try {

    const {userOrder,cartId}=req.body
    console.log(cartId,"its cartdId");
    const { razorpay_payment_id,razorpay_order_id,razorpay_signature}=req.body.response
    const userOrderData=await Order.findByIdAndUpdate(userOrder._id)
   
  let hmac=crypto.createHmac('sha256','1K3dgR8PXdK42NNRMYbicrrB')
    hmac.update(razorpay_order_id+"|"+razorpay_payment_id)
    hmac=hmac.digest("hex")
    if(hmac===razorpay_signature){
      await cart.findByIdAndDelete({ _id: cartId });
      for (const orderedProduct of userOrderData.items) {
        const orderedProductId = orderedProduct.product;
        const orderedQuantity = orderedProduct.quantity;
        const orderedProductSize = orderedProduct.size;
        const product = await Product.findById(orderedProductId);
        console.log(product,"its prodcuct");
  
        const updatedSizes = product.size.map((size) => {
          if (size.size === orderedProductSize) {
            size.quantity -= orderedQuantity;
          }
          return size;
        });
  
        product.size = updatedSizes;
        await product.save();
      }
  
      console.log(userOrder,"ist userOrder");
      userOrderData.status="Confirmed"
      userOrderData.save()


      res.json({status:true})
    }else{
      userOrderData.status="Canceled"
      userOrderData.totalAmount=-0
      for (const orderedProduct of userOrderData.items) {
        const orderedProductId = orderedProduct.product;
        const orderedQuantity = orderedProduct.quantity;
        const orderedProductSize = orderedProduct.size;
        const product = await Product.findById(orderedProductId);

        const updatedSizes = product.size.map((size) => {
          if (size.size === orderedProductSize) {
            size.quantity += orderedQuantity;
          }
          return size;
        });
        console.log(
          "its updated Sizekkkkkkkkkkkkkkk",
          updatedSizes,
          "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk"
        );
        product.size = updatedSizes;
        await product.save();
      }

      res.json({status:false,err})
    }


  } catch (error) {
    console.log(error.message)
  }
}

//order Success page

const load_orderSuccess = async (req, res) => {
  try {
    res.render("ordersuccesPage");
  } catch (error) {
    console.log(error.message);
  }
};

const viewOrderDeatails = async (req, res) => {
  try {
    const { orderId } = req.query;
    const userOrder = await Order.findById({ _id: orderId }).populate(
      "items.product"
    );
    res.render("orderdeatails", { userOrder });
  } catch (error) {
    console.log(error);
  }
};
const cancelOneProduct = async (req, res) => {
  try {
    // console.log(req.body);
    const { productId, userOrder, userId } = req.body;
    // console.log(typeof productId);

    const userOrders = await Order.findById({ _id: userOrder });
    const productIndex = userOrders.items.findIndex(
      (item) => item.product._id.toString() === productId.toString()
    );
    // console.log(productIndex,"its userOrders");
    userOrders.items[productIndex].isCancelled = true;
    const price = userOrders.items[productIndex].price;
    const orderedSize = userOrders.items[productIndex].size;
    const quantity = userOrders.items[productIndex].quantity;
    userOrders.totalAmount -= price;
    // console.log(userOrder,"userORder");
    await userOrders.save();
    const productData = await Product.findById(productId);
    // console.log( "gooted",productData);

    const updatedSizes = productData.size.map((size) => {
      if (size.size === orderedSize) {
        size.quantity += quantity;
      }
      return size;
    });
    productData.size = updatedSizes;
    await productData.save();
    res.json({ status: "items cancelled" });
  } catch (error) {
    console.error(error.message);
  }
};

//cancel order

const cancelOrder = async (req, res) => {
  try {
    console.log(req.body);
    const { orderId } = req.body;
    console.log(orderId, "///////////////////");
    const orderData = await Order.findByIdAndUpdate(
      orderId,
      { $set: { status: "Canceled", totalAmount: 0 } },
      { new: true }
    );

    if (orderData) {
      for (const orderedProduct of orderData.items) {
        const orderedProductId = orderedProduct.product;
        const orderedQuantity = orderedProduct.quantity;
        const orderedProductSize = orderedProduct.size;
        const product = await Product.findById(orderedProductId);

        const updatedSizes = product.size.map((size) => {
          if (size.size === orderedProductSize) {
            size.quantity += orderedQuantity;
          }
          return size;
        });
        console.log(
          "its updated Sizekkkkkkkkkkkkkkk",
          updatedSizes,
          "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk"
        );
        product.size = updatedSizes;
        await product.save();
      }
      res.json({ status: "order canceled" });
    }
  } catch (error) {
    console.log(error);
  }
}
const applycoupon=async(req,res)=>{
  try {
    console.log(req.body);
    const {couponId}=req.body
    
    const {userId}=req.session
    console.log(userId);
    const couponData=await coupon.findById({_id:couponId})
console.log(couponData,"its coupendata");
const couponDiscount=couponData.couponDiscount
const maximumDiscount=couponData.maximumDiscount
console.log(maximumDiscount,"maximumDiscount");
console.log(couponDiscount,"maximumDiscountAmount");
const userCart=await cart.findOne({userId:userId})
console.log(userCart,"hhhhhhhhhhhhhhhhhhhhhhhhhh");
const cartTotal=userCart.total
const couponDiscountApply=cartTotal*couponDiscount/100
console.log("couponDiscounted:",couponDiscountApply);
const checkMaximumAmount=cartTotal-maximumDiscount
console.log("checkMaximum:",checkMaximumAmount);
console.log(cartTotal,"it total");
} catch (error) {
    console.log(error.message)
  }
}


module.exports = {
  load_checkout,
  place_Order,
  load_orderSuccess,
  viewOrderDeatails,
  cancelOneProduct,
  cancelOrder,
  razorPaymentVerify,
  applycoupon
  
};

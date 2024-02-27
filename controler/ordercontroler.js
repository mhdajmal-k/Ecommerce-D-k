"use strict";

const cart = require("../model/cart_model");
const address = require("../model/address_model");
const Order = require("../model/order_model");
const User = require("../model/user_model");
const Product = require("../model/product_model");
const generateOrderNumber = require("./helper/orderId");
const order = require("../model/order_model");
const Razorpay = require('razorpay');



const razorpay = new Razorpay({
  key_id: process.env.RazopayId,
  key_secret: process.env.RazopaySecret
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
    if (items > 0) {
      const userAddress = await address.find({ user: user });
      res.render("checkout", {
        userCart: userCart,
        userAddress: userAddress,
        user: user,
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
    // console.log("hi");
    const userId = req.session.userId;
    const user = await User.findById(userId);
    const { cartId, addressId, paymentOption } = req.body;
    const userCart = await cart
      .findById({ _id: cartId })
      .populate("items.productId");
    // console.log(userCart, "gooted user CArt");
    
    for (let i = 0; i < userCart.items.length; i++) {
      const cartItem = userCart.items[i];
      // console.log(cartItem, "gotted userItesm");
      const product = cartItem.productId;
      if (!product) {
        return res.json({ status: "invalid product" });
      }
      if (product.isBlocked) {
        return res.json({ status: "blocked product"});
      }
      const sizeCheck = product.size.find((size) => {
        return size.size === cartItem.size;
      });
      if (!sizeCheck || sizeCheck.quantity < cartItem.quantity) {
        return res.json({ status: "out of stock"});
      }
    }
    console.log("hello");
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

    await cart.findByIdAndDelete({ _id: cartId });

    for (const orderedProduct of createOrder.items) {
      const orderedProductId = orderedProduct.product;
      const orderedQuantity = orderedProduct.quantity;
      const orderedProductSize = orderedProduct.size;
      const product = await Product.findById(orderedProductId);

      const updatedSizes = product.size.map((size) => {
        if (size.size === orderedProductSize) {
          size.quantity -= orderedQuantity;
        }
        return size;
      });
      console.log(updatedSizes);
      product.size = updatedSizes;
      await product.save();
    }

    if (paymentOption === "cod") {
      res.json({ status: "order placed" });
    }
  } catch (error) {
    console.log(error.message);
    return res.json({ status: "error", message: error.message });
  }
};


//order Success page

const load_orderSuccess = async (req, res) => {
  try {
    res.render("ordersuccesPage");
  } catch (error) {
    console.log(error.message)
  }
};

const viewOrderDeatails = async (req, res) => {
  try {
    const { orderId } = req.query;
    const userOrder = await order
      .findById({ _id: orderId })
      .populate("items.product");
    res.render("orderdeatails", { userOrder });
  } catch (error) {
    console.log(error);
  }
};
const cancelOneProduct=async(req,res)=>{
  try {
    console.log("Hi");
   console.log(req.body); 
  } catch (error) {
    console.error(error.message)
  }
}

//cancel order

const cancelOrder = async (req, res) => {
  try {
    console.log(req.body);
    const { orderId } = req.body;
    console.log(orderId, "///////////////////");
    const orderData = await order.findByIdAndUpdate(
      orderId,
      { $set: { status: "Canceled" } },
      { new: true }
    );

    if (orderData) {
      for (const orderedProduct of orderData.items) {
        const orderedProductId = orderedProduct.product;
        const orderedQuantity = orderedProduct.quantity;
        const orderedProductSize = orderedProduct.size;
        const product = await Product.findById(orderedProductId);
        console.log(":-----------------------");
        console.log(orderedProductId);
        console.log(":-----------------------");
        console.log(orderedQuantity);
        console.log(":-----------------------");
        console.log(orderedProductSize);

        const updatedSizes = product.size.map((size) => {
          if (size.size === orderedProductSize) {
            size.quantity += orderedQuantity;
          }
          return size;
        });
        product.size = updatedSizes;
        await product.save();
      }
      res.json({ status: "order canceled" });
    }
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  load_checkout,
  place_Order,
  load_orderSuccess,
  viewOrderDeatails,
  cancelOneProduct,
  cancelOrder,
};

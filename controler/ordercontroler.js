"use strict";
const cart = require("../model/cart_model");
const address = require("../model/address_model");
const User = require("../model/user_model");
const Product = require("../model/product_model");
const coupon = require("../model/coupon");
const generateOrderNumber = require("./helper/orderId");
const Order = require("../model/order_model");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Wallet=require("../model/wallet")
const{ Transaction}=require("../model/transaction")
const { log } = require("console");

////////////////////////RAZORpAY INSTANCE CREATION/////////////////////////////

const razorpayInstance = new Razorpay({
  key_id: process.env.RazorPayId,
  key_secret: process.env.RazorPaySecret,
});

///////////////////////////////////////////////////////////////

//////////////////////////////CHECKOUT PAGE//////////////////////////////////

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
    const userCartTOtal = userCart.total;
    if (items > 0) {
      const userAddress = await address.find({ user: user });
      const currentDate = new Date();
      ///////////////////////////////clear this ///////////////
      const coupons = await coupon.find({
        $and: [
          { listed: true },
          { user: { $nin: [user] } },
          { minimumPrice: { $lte: parseFloat(userCartTOtal) } },
          { expiryDate: { $gte: currentDate } },
        ],
      });
      res.render("checkout", {
        userCart: userCart,
        userAddress: userAddress,
        user: user,
        coupons: coupons,
      });
    } else {
      res.redirect("/cart");
    }
  } catch (error) {
    console.error(error.message);
  }
};

//////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////PALCE ORDER/////////////////////////////
const place_Order = async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId);
    const { cartId, addressId, paymentOption, total } = req.body;
    const cartIdforPassing = cartId;
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
    let order;
    if (req.session.couponAmount) {
      const couponDiscount = req.session.couponAmount;
      const orderTotal = userCart.total - couponDiscount;

      order = {
        userId: user._id,
        orderNumber: orderNumber,
        items: orderProducts,
        totalAmount: orderTotal,
        couponDiscount: couponDiscount,
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
    } else {
      order = {
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
    }
    const createOrder = await Order.create(order);
    if (paymentOption === "cod") {
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
        product.size = updatedSizes;
        await product.save();
      }
      if (req.session.couponID) {
        const couponId = req.session.couponID;
        const { userId } = req.session;
        const couponData = await coupon.findById(couponId);
        couponData.user.push(userId);
        await couponData.save();
        delete req.session.couponID;
        delete req.session.couponAmount;
      }
      res.json({ status: "order placed" });
      return;
    }
    if (paymentOption === "razorPay") {
      console.log(createOrder.totalAmount, "its cerate order 2");
      const generateRazor = await generateRazorPay(
        createOrder.totalAmount,
        createOrder.orderNumber
      );
      console.log(generateRazor);
      res.json({
        status: "razorPay",
        generateRazor,
        user,
        userOrder: createOrder,
        cartIdforPassing,
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.json({ status: "error", message: error.message });
  }
};
///////////////////////////////////////////////////////////////////

//////////////////////////razorpay core function

function generateRazorPay(orderAmount, orderId) {
  return new Promise((resolve, reject) => {
    const options = {
      amount: parseInt(orderAmount) * 100,
      currency: "INR",
      receipt: orderId.toString(),
    };
    razorpayInstance.orders.create(options, (err, order) => {
      if (err) {
        console.log(err);
      } else {
        console.log(order, "its order");
        resolve(order);
      }
    });
  });
}
////////////////////////////////////////

/////////////////////////verifying //////////////////////

const razorPaymentVerify = async (req, res) => {
  try {
    const { userOrder, cartId } = req.body;
    console.log(cartId, "its cartdId");
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body.response;
    const userOrderData = await Order.findByIdAndUpdate(userOrder._id);
    let hmac = crypto.createHmac("sha256", "1K3dgR8PXdK42NNRMYbicrrB");
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    hmac = hmac.digest("hex");
    if (hmac === razorpay_signature) {
      await cart.findByIdAndDelete({ _id: cartId });
      for (const orderedProduct of userOrderData.items) {
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
        product.size = updatedSizes;
        await product.save();
      }
      if (req.session.couponID) {
        const couponId = req.session.couponID;
        const { userId } = req.session;
        const couponData = await coupon.findById(couponId);
        couponData.user.push(userId);
        await couponData.save();
        delete req.session.couponID;
        delete req.session.couponAmount;
      }
      userOrderData.status = "Confirmed";
      userOrderData.save();
      res.json({ status: true });
    } else {
      userOrderData.status = "Canceled";
      userOrderData.totalAmount = -0;
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
      res.json({ status: false, err });
    }
  } catch (error) {
    console.log(error.message);
  }
};
///////////////////////////////////////

////////////////////////////order Success page
const load_orderSuccess = async (req, res) => {
  try {
    res.render("ordersuccesPage");
  } catch (error) {
    console.log(error.message);
  }
};

////////////////////////////////////////////

//////////////////////////order Details/////////////////////

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
/////////////////////////////////////////


const cancelOneProduct = async (req, res) => {
  try {
    const { productId, userOrder, userId } = req.body;
    const userOrders = await Order.findById({ _id: userOrder });
    const productIndex = userOrders.items.findIndex(
      (item) => item.product._id.toString() === productId.toString()
    );
    userOrders.items[productIndex].isCancelled = true;
    const price = userOrders.items[productIndex].price;
    const orderedSize = userOrders.items[productIndex].size;
    const quantity = userOrders.items[productIndex].quantity;
    userOrders.totalAmount -= price;
    await userOrders.save();
    if(userOrders.payment=="razorPay"){
      const user=userOrders.userId
      let UserWallet = await Wallet.findOne({user:user});
      if (!UserWallet) {
        UserWallet = new Wallet({
          user: userOrders.userId,
          balance: price,
          transactions: [],
        });
      } else {
        UserWallet.balance += price;
      }
      const transaction = new Transaction({
        user: userOrders.userId,
        amount: price,
        type: "refund",
        description: "refund money for you Cancelled One product",
      });
      UserWallet.transactions.push(transaction._id);
      await Promise.all([transaction.save(), UserWallet.save()]);
    }
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
    console.error(error.message,"from here");
  }
};

///////////////////////cancel order
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const orderData = await Order.findByIdAndUpdate(
      orderId,
      { $set: { status: "Canceled" } },
      { new: true }
    );
    if(orderData.payment=="razorPay"){
      console.log(orderData.userId);
      const user=orderData.userId
      let UserWallet = await Wallet.findOne({user:user});
      if (!UserWallet) {
        UserWallet = new Wallet({
          user: orderData.userId,
          balance: orderData.totalAmount,
          transactions: [],
        });
      } else {
        UserWallet.balance += orderData.totalAmount;
      }
      const transaction = new Transaction({
        user: orderData.userId,
        amount: orderData.totalAmount,
        type: "refund",
        description: "refund money for you Cancelled Order",
      });
      UserWallet.transactions.push(transaction._id);
      await Promise.all([transaction.save(), UserWallet.save()]);
    }
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
};
/////////////////////////////////

///////////////////apply coupons/////////////////////
const applycoupon = async (req, res) => {
  try {
    const { couponId } = req.body;
    const { userId } = req.session;
    const couponData = await coupon.findById(couponId);
    if (!couponData) {
      return res.status(404).json({ error: "Coupon not found" });
    }
    if (!couponData.listed) {
      return res.json({ status: false, message: "Coupon is not listed" });
    }
    const couponDiscount = couponData.couponDiscount;
    const maximumDiscount = couponData.maximumDiscount;

    const userCart = await cart.findOne({ userId: userId });
    if (!userCart) {
      return res.status(404).json({ error: "Cart not found" });
    }
    const cartTotal = userCart.total;
    const couponDiscountApply = (cartTotal * couponDiscount) / 100;
    const discountedAmount = Math.min(couponDiscountApply, maximumDiscount);
    req.session.couponAmount = discountedAmount;
    req.session.couponID = couponId;
    res.json({ status: true, discountedAmount });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
///////////////////////////////////

///////////////////////return//////////////////

const returnRequest = async (req, res) => {
  try {
    const { reason, userOrder } = req.body;
    const userOrderData = await Order.findById(userOrder);
    console.log(userOrderData);
    userOrderData.reasonForCancel = reason;
    userOrderData.status = "Pending Return Request";
    await userOrderData.save();
    res.json({ status: true });
  } catch (error) {
    console.log(error.message);
  }
};


const generatePdf=async(req,res)=>{
  console.log(req.body);
  const { htmlContent } = req.body;
    const fileName = 'invoice.pdf'; // Name of the PDF file

    pdf.create(htmlContent).toFile(fileName, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: 'Failed to generate PDF' });
        }

       
        res.status(200).json({ success: true, pdfUrl: pdfUrl });
    });
}

////////////////////////////////////
module.exports = {
  load_checkout,
  place_Order,
  load_orderSuccess,
  viewOrderDeatails,
  cancelOneProduct,
  cancelOrder,
  razorPaymentVerify,
  applycoupon,
  returnRequest,
  generatePdf

};

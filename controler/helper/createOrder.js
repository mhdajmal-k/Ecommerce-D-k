
function createOrder(userAddress,user,userCart,orderProducts,orderNumber,paymentOption,couponAmount){
    console.log(userAddress,"its the User Address");
    console.log(user,"this is the user");
    console.log(userCart,"this is the userCart");
    console.log("here");
    console.log(couponAmount,"it the coupon amount");
let order = { 
    userId: user._id,
    orderNumber,
    items: orderProducts,
    totalAmount: couponAmount ? Math.ceil(userCart.total - couponAmount) : userCart.total,
    couponDiscount: couponAmount || 0,
    status:"pending",
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
  }
  return order
}

module.exports=createOrder
const order = require("../model/order_model");
const Wallet = require("../model/wallet");
const { Transaction } = require("../model/transaction");
const WalletCreationAndUpdating=require("../controler/helper/walletCrationAndUpdation")


///////////////////////orders///////////////
const load_orders = async (req, res) => {
  try {
    const orderCount = await order.find().count();
    const page = req.query.page || 1;
    const pagesize = 10;
    const skip = (page - 1) * pagesize;
    const totalPage = Math.ceil(orderCount / pagesize);
    const orders = await order.find()
    .populate("userId")
    .sort({ orderDate: -1 }) 
    .skip(skip)
    .limit(pagesize);
    res.render("orderList", { orders: orders,  totalPage,
      currentPage: page });
  } catch (error) {
    console.error(error.message);
  }
};

////////////////////////////

//////////////////Order Details///////////////////

const load_ordersDetails = async (req, res) => {
  try {
    const { orderId } = req.query;
    const orderData = await order
      .findById({ _id: orderId })
      .populate("userId")
      .populate({
        path: "items.product",
        populate: {
          path: "categoryId",
        },
      });
    res.render("orderDeatails", { orderData: orderData });
  } catch (error) {
    console.log(error.message);
  }
};

/////////////////////////////

////////////////////////changing Order Status////////////

const changeOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    let changeOrderStatus = await order.findByIdAndUpdate(
      { _id: orderId },
      { $set: { status: status } }
    );
    if (!changeOrderStatus) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (status === "Returned") {
      const userOrder = await order.findById(orderId);
      const user = userOrder.userId;
      const totalAmount = userOrder.totalAmount;
     const updated=await WalletCreationAndUpdating(user,totalAmount)
    }
    res.json({ status: "orderStatusChanged" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server error" });
  }
};

// module.exports = {
//   changeOrderStatus,
// };

module.exports = {
  load_orders,
  load_ordersDetails,
  changeOrderStatus,
};

const order = require("../model/order_model");
const Wallet= require("../model/wallet")
const {Transaction}= require("../model/transaction");


const load_orders = async (req, res) => {
  try {
    const orders = await order.find().populate("userId");
    res.render("orderList", { orders: orders });
  } catch (error) {
    console.error(error.message);
  }
};

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

      let UserWallet = await Wallet.findOne({ user: user });

      if (!UserWallet) {
        UserWallet = new Wallet({
          user: user,
          balance: totalAmount,
          transactions: []
        });
      } else {
        UserWallet.amount += totalAmount;
      }

      const transaction = new Transaction({
        user: user,
        amount: totalAmount,
        type: "refund",
        description: "refund money for your return order"
      });

      UserWallet.transactions.push(transaction._id);
      await Promise.all([transaction.save(), UserWallet.save()]);
    }

    res.json({ status: "orderStatusChanged" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  changeOrderStatus
};




module.exports = {
  load_orders,
  load_ordersDetails,
  changeOrderStatus,
};

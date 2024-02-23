const order = require("../model/order_model");

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
    console.log(req.body);
    const { orderId, status } = req.body;
    const changeOrderStatus = await order.findByIdAndUpdate(
      { _id: orderId },
      { $set: { status: status } }
    );
    if (changeOrderStatus) {
      res.json({ status: "orderStatusChanged" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = {
  load_orders,
  load_ordersDetails,
  changeOrderStatus,
};

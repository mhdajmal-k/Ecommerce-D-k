const user = require("../model/user_model");
const admin_model = require("../model/admin_model");
const Order = require("../model/order_model");
const Product = require("../model/product_model");
const Category = require("../model/category");
const Reviews=require("../model/rating_model")
const session = require("express-session");
const { render } = require("../router/admin_routers");

////////////login page

const login_load = async (req, res) => {
  if (req.session.admin) {
    res.redirect("/admin/dashboard");
  }
  try {
    res.render("adminLogin");
  } catch (error) {
    console.log(error.message + "from herer");
  }
};
////////////////////////////////////////////////////////

//////////verification Login
const verify_login = async (req, res) => {
  try {
    const { password, email } = req.body;
    const adminEmail = await admin_model.findOne({ email: email });

    if (adminEmail) {
      const adminPassword = await admin_model.findOne({ password: password });
      if (adminPassword) {
        req.session.admin = adminEmail._id;
        req.session.adminOn = true;

        res.redirect("/admin/dashboard");
      } else {
        res.render("adminLogin", { message: "password is incorrect!" });
      }
    } else {
      res.render("adminLogin", { message: "Incorrect Email!" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
///////////////////////////////////////////

////////////////dashboard

const Dashboard_load = async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $in: ["Delivered", "shipped", "Confirmed"] },
    }).countDocuments();
    const productCont = await Product.find({
      isBlocked: "false",
    }).countDocuments();
    const categories = await Category.find({ isList: "true" }).countDocuments();
    const totalSale = await Order.aggregate([
      {
        $match: { status: "Delivered" },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);
    const monthlySales = await Order.aggregate([
      {
        $match: {
          status: "Delivered",
          orderDate: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
        },
      },
    ]);
    res.render("adminDashboard", {
      orders,
      productCont,
      categories,
      totalSale,
      monthlySales,
    });
  } catch (error) {
    console.log(error.message);
  }
};

///////////////////////////////////

///////////////////////users list

const userLoad = async (req, res) => {
  try {
    const userData = await user.find({});
    res.render("usersList", { users: userData });
  } catch (error) {
    console.log(error.message);
  }
};
///////////////////////////////////////

////////////////////////userBlock and unblock
const userBlockUnblock = async (req, res) => {
  try {
    const { userId, status } = req.body;
    if (status) {
      const block = await user.updateOne(
        { _id: userId },
        { $set: { is_block: status } }
      );
      res.json({ status: true });
    } else {
      console.log(error.message);
      res.json({ status: false });
    }
  } catch (error) {
    console.error(error.message);
  }
};

////////////////////////////////

////////////////////Sales Report load

const load_saleReport = async (req, res) => {
  try {
    console.log("hi");
    const salereport = await Order.find({ status: { $in: ["Delivered"] } })
      .populate("userId")
      .populate("items.product");
    console.log(salereport, "its wind");
    res.render("salereport", { salereport });
  } catch (error) {
    console.log(error);
  }
};

///////////////////////////////////

////////////////////////sorting Sales Report
const sortSalesReport = async (req, res) => {
  try {
    const { sortby, date } = req.query;
    let SaleData;

    switch (sortby) {
      case "today":
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        SaleData = await Order.find({
          status: "Delivered",
          orderDate: { $gte: todayDate, $lte: todayEnd },
        })
          .populate("userId")
          .populate("items.product");
        break;

      case "weekly":
        const startOfWeek = new Date();
        startOfWeek.setHours(0, 0, 0, 0);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date();
        endOfWeek.setHours(23, 59, 59, 999);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        SaleData = await Order.find({
          status: "Delivered",
          orderDate: { $gte: startOfWeek, $lte: endOfWeek },
        })
          .populate("userId")
          .populate("items.product");
        break;
      case "Monthly":
        console.log("hiffffffffffffff");

        const startOfMonth = new Date();
        startOfMonth.setHours(0, 0, 0, 0);
        startOfMonth.setDate(1);
        const endOfMonth = new Date(
          startOfMonth.getFullYear(),
          startOfMonth.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );
        SaleData = await Order.find({
          status: "Delivered",
          orderDate: { $gte: startOfMonth, $lte: endOfMonth },
        })
          .populate("userId")
          .populate("items.product");
        console.log(SaleData);
        break;
      case "yearly":
        const startOfYear = new Date(new Date().getFullYear(), 0, 1);
        const endOfYear = new Date(
          new Date().getFullYear(),
          11,
          31,
          23,
          59,
          59,
          999
        );
        SaleData = await Order.find({
          status: "Delivered",
          orderDate: { $gte: startOfYear, $lte: endOfYear },
        })
          .populate("userId")
          .populate("items.product");

        break;
      case "customDate":
        const customDate = new Date(date);
        const nextDay = new Date(customDate);
        nextDay.setDate(customDate.getDate() + 1);
        SaleData = await Order.find({
          status: "Delivered",
          orderDate: { $gte: customDate, $lt: nextDay },
        })
          .populate("userId")
          .populate("items.product");
        break;
      default:
        return res.status(400).json({ message: "Invalid sortby parameter" });
    }
    res.json({ saleData: SaleData });
  } catch (error) {
    console.log(error);
  }
};
/////////////////////////////////////

/////////////load_review

const load_review=async(req,res)=>{
  try {
    console.log("hi");
    const review=await Reviews.find({}).populate('productId').populate("userId")
    console.log(review,"it reviwe");
    res.render("reviews",{review})
  } catch (error) {
    console.log(error)
  }
}

//////////////////////////logout

const logout = async (req, res) => {
  try {
    req.session.admin = null;
    req.session.adminOn = false;
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};
////////////////////////////

module.exports = {
  login_load,
  verify_login,
  Dashboard_load,
  userLoad,
  userBlockUnblock,
  logout,
  load_saleReport,
  sortSalesReport,
  load_review
};

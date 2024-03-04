const flash = require("express-flash");
const coupon = require("../model/coupon");
const { findById } = require("../model/user_model");

const load_coupon = async (req, res) => {
  try {

    const couponData = await coupon.find({});

    res.render("coupon", { couponData: couponData });
  } catch (error) {
    console.log(error);
  }
};

const addCoupons = async (req, res) => {
  try {
    console.log("hi");
    res.render("addCoupons");
  } catch (error) {
    console.log(error.message);
  }
};

const CreateCoupons = async (req, res) => {
  try {
    console.log(req.body);

    const {
      couponCode,
      expiryDate,
      couponDiscount,
      maximumDiscount,
      minimumPurchase,
    } = req.body;
    const  couponName=couponCode.toUpperCase()
    const existingCoupon=await coupon.findOne({couponCode:couponName})
    console.log(existingCoupon,"asdhnfashdk");
    if(existingCoupon){
        res.render('addCoupons',{message:'already exist'})
        return
    }
    if (minimumPurchase) {
      const couponData = new coupon({
        couponCode: couponCode.toUpperCase(),
        expiryDate: expiryDate,
        couponDiscount: couponDiscount.toUpperCase(),
        minimumPrice: minimumPurchase,
        maximumDiscount: maximumDiscount,
      });
      if (couponData) {
        await couponData.save();
        res.redirect("/admin/coupon");
      }
    } else {
      const couponData = new coupon({
        couponCode: couponCode.toUpperCase(),
        expiryDate: expiryDate,
        couponDiscount: couponDiscount.toUpperCase(),
        maximumDiscount: maximumDiscount,
      });
      if (couponData) {
        await couponData.save();
        res.redirect("/admin/coupon");
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const load_couponEdit = async (req, res) => {
  try {
    console.log(req.query);
    const couponData = await coupon.findById(req.query.id);
    console.log(couponData, "its coupoon data");
    if (couponData) {
      res.render("editCoupon", { couponData });
    }
  } catch (error) {
    console.log(error);
  }
};

const editCoupon = async (req, res) => {
  try {
    console.log(req.body);
    const {
      couponCode,
      expiryDate,
      couponDiscount,
      maximumDiscount,
      minimumPurchase,
      CouponId,
    } = req.body;

    

    const updateCoupon = await coupon.findByIdAndUpdate(
      { _id: CouponId },
      {
        $set: {
          couponCode: couponCode.toUpperCase(),
          couponDiscount: couponDiscount,
          expiryDate: expiryDate,
          maximumDiscount: maximumDiscount,
          minimumPrice: minimumPurchase,
        },
      },
      { new: true }
    );
    if (updateCoupon) {
      res.redirect("/admin/coupon");
    } else {
      res.render("editCoupon", { message: "something went happened" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const delete_coupon=async(req,res)=>{
    try {
        console.log(req.body);
        const deleteCoupon=await coupon.findByIdAndDelete(req.body.Id)
        if(deleteCoupon){
            res.json({status:true})
        }else{
            res.json({status:false})
        }
    } catch (error) {
        console.log(error)
    }
} 


const statusChange=async(req,res)=>{
  const couponData=await coupon.findById(req.body.couponId)
  console.log(couponData);
  if(couponData.listed==true){
    couponData.listed=false
    await couponData.save()
    res.json({status:"coupon is unlisted"})
  }else{
    couponData.listed=true
    await couponData.save()
    res.json({status:"coupon is listed"})

  }
}

module.exports = {
  load_coupon,
  addCoupons,
  CreateCoupons,
  load_couponEdit,
  editCoupon,
  delete_coupon,
  statusChange
};

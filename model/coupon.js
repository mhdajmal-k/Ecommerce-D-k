const mongoose = require("mongoose");

const coupon_Schema = new mongoose.Schema({
 
  couponCode: {
    type: String,
    require: true,
    unique: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  couponDiscount: {
    type: Number,
    required: true,
  },
  maximumDiscount: {
    type: Number,
    required: true,
  },
  minimumPrice:{
    type:Number,
    default:0

  },
  staringDate: {
    type: Date,
    default:Date.now()
    
  },
  listed: {
    type: Boolean,
    default: true,
  },user:{
    type:Array
  }
});

const coupon_model = mongoose.model("coupon", coupon_Schema);
module.exports = coupon_model;

const mongoose = require("mongoose");
const { array } = require("../controler/helper/multer");

const Product_model = new mongoose.Schema({
  productId: {
    type: String,
    require: true
  },
  productName: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
  color:{
type:String
  },
  price: {
    type: Number,
    require: true,
  },
 sellingPrice: {
    type: Number,
  },
  image: [{
    type: String,
    require: true,
  }],
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "categories",
    require: true,
  },
  size:  [
    {
        size: { type: String, enum: ["S", "M", "L", "XL"] },
        quantity: { type: Number, default: 0 }
    }
],
  quantity: {
    type: Number,
    require: true,
  },
  isBlocked: {
    type: Boolean,
    require: true,
    default:false
  },
});

const Product=mongoose.model('product',Product_model)
module.exports=Product
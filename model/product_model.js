const mongoose = require("mongoose");

const Product_model = new mongoose.Schema({
  productId: {
    type: String,
    require: true,
    unique: true,
  },
  productName: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
  price: {
    type: Number,
    require: true,
  },
  offerPrice: {
    type: Number,
  },
  image: {
    type: String,
    require: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
    require: true,
  },
  size: {
    type: Number,
    require: true,
  },
  quantity: {
    type: Number,
    require: true,
  },
  productStatus: {
    type: Boolean,
    require: true,
  },
});

const Product=mongoose.model('product',Product_model)
module.exports=Product
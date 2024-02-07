const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const address_model = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    require: true,
  },
  name: {
    type: String,
    require: true,
    trim: true,
  },
  pinCode: {
    type: Number,
    require: true,
  },
  locality: {
    type: String,
    require: true,
  },
  address: {
    type: String,
    required: true,
  },
  cityDistrictTown: {
    type: String,
    required: true,
  },

  state: {
    type: String,
    required: true,
  },
  landmark: {
    type: String,
  },
  alternatePhone: {
    type: Number,
  },
  addressType: {
    type: String,
    required: true,
    enum: ["home", "work"],
    required: true,
  },
});


const UserAddress=mongoose.model("address",address_model)

module.exports=UserAddress
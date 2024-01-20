const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const user_schema = new Schema({
  username: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  mobile: {
    type: Number,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
  createdAT: {
    type: Date,
    default: Date.now,
  },
  is_admin: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const user=mongoose.model("users",user_schema)
module.exports=user

const mongoose = require("mongoose");


const RatingSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  review: {
    type: String
  }
}, {
  timestamps: true
});

// Create Rating model
const Rating = mongoose.model('Rating', RatingSchema);

module.exports = Rating;

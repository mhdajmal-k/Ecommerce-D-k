const mongoose = require("mongoose");

const wishList = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product",
            required: true
        }
    }]
});

const wishList_model = mongoose.model("wishList",wishList);

module.exports = wishList_model;
l
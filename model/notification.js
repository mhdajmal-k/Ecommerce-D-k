
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
   userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
   },
   messages: [{
    orderId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "order" 
    },
    message: {
        type: String,
    },
    topic: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
   }]
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;

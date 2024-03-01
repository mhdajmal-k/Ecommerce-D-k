const mongoose=require("mongoose")

const cart_model = new mongoose.Schema({
    userId: {  
        type: String,
        require: true
    },
    items: [{
        productId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "product",
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        subTotal: {
            type: Number,
            required: true,
         default: 0
        },size:{
            type:String,
            require:true
    
        }
    }],
    total: {
        type: Number,
        require: true,
        default: 0
    }
}, {
    timestamps: true
});


const cart=mongoose.model("cart",cart_model)

module.exports=cart
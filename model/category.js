const mongoose=require("mongoose")

const category_schema=new mongoose.Schema({
    categoryTitle:{
        type:String,
        require:true,
    },
    description :{
        type:String,
        require:true
    },
    createdAt:{
        type:Date,
        default: Date.now,
    },
    offerPrice: {
        type: Number,
        default: 0 // Set a default value if needed
    },
    isList:{
        type:Boolean,
        default:true

    }
    
})

const category=mongoose.model("categories",category_schema)

module.exports=category

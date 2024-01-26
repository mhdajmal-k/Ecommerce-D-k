const mongoose=require("mongoose")

const category_model=new mongoose.Schema({
    categoryName:{
        type:String,
        require:true
    },
    description :{
        type:String,
        require:true
    },
    Image:{
        type:String,
        require:true
    },
    createdAt:{
        type:Date,
        default: Date.now,
    }
    
})

const category=mongoose.model("category",category_model)

module.exports={category}

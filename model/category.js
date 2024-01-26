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
    }
    
})

const category=mongoose.model("categories",category_schema)

module.exports=category

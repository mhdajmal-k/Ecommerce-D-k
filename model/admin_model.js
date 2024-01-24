const mongoose=require("mongoose")
const { schema } = require("./user_model")
const Schema=mongoose.Schema

const admin_schema=new Schema({
    email:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    },
})
const admin_model=mongoose.model("admin",admin_schema)
module.exports=admin_model
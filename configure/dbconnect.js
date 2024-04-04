const mongoose=require("mongoose")

const dbConnect=(()=>{
    
    mongoose.connect("mongodb://localhost:27017/duck&wave").then(()=>{
        console.log("db connected Successfully...")
    })
    .catch((err)=>{
        console.log(err.message)
    
    })
})

module.exports=dbConnect
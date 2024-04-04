const mongoose=require("mongoose")

const dbConnect=(()=>{
    
    mongoose.connect("mongodb+srv://ajmalchundappuram:q0sj5VZoentLmMxd@duckandwave.zsjjlfm.mongodb.net/duck&wave?retryWrites=true&w=majority&appName=duckandwave"||"mongodb://localhost:27017/duck&wave").then(()=>{
        console.log("db connected Successfully...")
    })
    .catch((err)=>{
        console.log(err.message)
    
    })
})

module.exports=dbConnect
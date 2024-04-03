const mongoose=require("mongoose")

const dbConnect=(()=>{
    
    mongoose.connect(process.env.db2||process.env.db,{ useNewUrlParser: true }).then(()=>{
        console.log("db connected Successfully...")
    })
    .catch((err)=>{
        console.log(err.message)
    
    })
})

module.exports=dbConnect
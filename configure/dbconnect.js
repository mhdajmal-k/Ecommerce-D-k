const mongoose=require("mongoose")

const dbConnect=(()=>{
    mongoose.connect(`${process.env.db}/duck&wave`).then(()=>{
        console.log("db connected Successfully...")
    })
    .catch((err)=>{
        console.log(err.message)
    
    })
})

module.exports=dbConnect
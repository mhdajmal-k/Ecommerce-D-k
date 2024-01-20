const express=require("express")
const dotenv=require("dotenv").config()
const app=express()
const path=require("path")
const dbConnect=require('./configure/dbconnect')
dbConnect()


app.use(express.static(path.join(__dirname,'public')));


const user_router=require('./router/user_routers')
app.use('/',user_router)


const admin_router=require('./router/admin_routers')
app.use('/admin',admin_router)



port=process.env.port||3001
app.listen(port,()=>{
    console.log(`server is ready${port}`)
})
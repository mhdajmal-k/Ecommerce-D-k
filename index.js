const express=require("express")
const dotenv=require("dotenv").config()
const app=express()
const path=require("path")
const dbConnect=require('./configure/dbconnect')
const session=require("express-session")
dbConnect()

app.use(session({
   secret:process.env.session,
    resave:false,
    saveUninitialized:false,
}))

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,'public')));


const user_router=require('./router/user_routers')
app.use('/',user_router)


const admin_router=require('./router/admin_routers')
app.use('/admin',admin_router)



app.use("*",(req,res)=>{
   res.status(404).json("page not found!")
 
})
app.use((err, req, res, next) => {
    console.error('An error occurred:', err);
    res.status(500).send('Internal Server Error');
});


port=process.env.port||3001
app.listen(port,()=>{
    console.log(`server is ready${port}`)
})
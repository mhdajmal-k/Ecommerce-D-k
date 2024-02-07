const express=require("express")
const dotenv=require("dotenv").config()
const app=express()
const path=require("path")
const dbConnect=require('./configure/dbconnect')
const session=require("express-session")
const flash=require("express-flash")
const nocache = require('nocache');
dbConnect()

//session
app.use(session({
   secret:process.env.session,
    resave:false,
    saveUninitialized:false,
}))


app.use(nocache())
app.use(express.json())
app.use(flash())
app.use(express.urlencoded({extended:true}))

//static files
app.use(express.static(path.join(__dirname,'public')));
app.use("/uploads",express.static(path.join(__dirname,'/uploads')));


//routers
const user_router=require('./router/user_routers')
app.use('/',user_router)
const admin_router=require('./router/admin_routers')
app.use('/admin',admin_router)


//404 page
app.use("/*",(req,res)=>{
   res.status(404).json("page not found!")
 
})

//error

app.use((err, req, res, next) => {
    console.error('An error occurred:', err);
    res.status(500).send('Internal Server Error');
});


//port
port=process.env.port||3001
app.listen(port,()=>{
    console.log(`server is ready${port}`)
})
'use strict';
const express=require("express")
const dotenv=require("dotenv").config()
const app=express()
const path=require("path")
const dbConnect=require('./configure/dbconnect')
const session=require("express-session")
const flash=require("express-flash")
const nocache = require('nocache');
const morgan=require('morgan')
const compression = require('compression')


// const passport=require("passport")

dbConnect()



////////session
app.use(session({
   secret:process.env.session,
    resave:false,
    saveUninitialized:true,
}))



// app.use(passport.initialize())  
// app.use(passport.session())  
app.use(compression())
app.use(nocache())
app.use(express.json())
app.use(flash())
app.use(express.urlencoded({extended:true}))
app.use(morgan("dev"))


//static files
app.use(express.static(path.join(__dirname,'public')));
app.use("/uploads",express.static(path.join(__dirname,'/uploads')));



//routers
const admin_router=require('./router/admin_routers')
app.use('/admin',admin_router)


const user_router=require('./router/user_routers')
app.use('/',user_router)



//404 page
app.use("/*",(req,res)=>{
res.sendFile(path.join(__dirname,"404.html"))
   
 
})

///////Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('An error occurred:', err);
    res.sendFile(path.join(__dirname,"500.html"))
});


///////port
 const port=process.env.port||3001
app.listen(port,()=>{
    console.log(`server is ready${port}`)
})
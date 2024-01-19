const express=require("express")
const dotenv=require("dotenv").config()
const app=express()
const path=require("path")

app.set("view engine","ejs")
// app.set('views',"./views/admin")

app.use(express.static(path.join(__dirname,"public")))



app.get("/",(req,res)=>{
    res.render("landing_page")
})
app.get("/admin_panel",(req,res)=>{
    res.render("admin_panel")
})

port=process.env.port||3001

app.listen(port,()=>{
    console.log(`server is ready${port}`)
})
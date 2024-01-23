const user=require("../model/user_model")
const bcrypt=require("bcrypt")
const nodemailer=require("nodemailer")

const landing_page=async(req,res)=>{
    try {
        res.render("landing_page")
    } catch (error) {
        console.log(error.message)
    }
}
const load_login=async(req,res)=>{
    try {
        res.render("login_page")
        
    } catch (error) {
        console.log(error.message)
    }
}
const load_singup=async(req,res)=>{
    try {
        res.render("singup")
    } catch (error) {
        console.log(error.message)
    }
}
const otp_verification=async(req,res)=>{
    try {
        res.render("otp_page")
        
    } catch (error) {
        console.log(error.message)
    }
}

module.exports={
    landing_page,
load_login,
load_singup,
otp_verification}
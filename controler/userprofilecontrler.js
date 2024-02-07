const { session } = require("passport");
const user = require("../model/user_model");




const load_profile=async (req,res)=>{
    try {
        console.log(  req.session.userId,'from the session in loginTTTTTTTTTTTTTTTTT');

    const userData=await user.findById(req.session.userId)
    console.log(userData.username,"goted name form the session");
      res.render("profile",{user:userData})
    } catch (error) {
      console.log(error.message)
    }
  }


  const load_addAddress=async(req,res)=>{
    try {
      res.render("addAddress")
    } catch (error) {
      console.log(error.message)
    }

  }


  module.exports={
    load_profile,
    load_addAddress
  }
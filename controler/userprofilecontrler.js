'use strict';
const address = require("../model/address_model");
const user = require("../model/user_model");
const order=require("../model/order_model")
const { session } = require("passport");
const { json } = require("express");
const securePassword=require("../controler/helper/securingPassword");
const bcrypt=require("bcrypt")
const coupon=require("../model/coupon")
const Wallet=require("../model/wallet")

// 

const load_profile = async (req, res) => {
  try {
    console.log(
      req.session.userId,
      "from the session in loginTTTTTTTTTTTTTTTTT"
    );

    const userData = await user.findById(req.session.userId);
    const userAddress = await address.find({ user: req.session.userId });
    res.render("profile", { user: userData, userAddress: userAddress });
  } catch (error) {
    console.log(error.message);
  }
};
const load_order=async(req,res)=>{
  try {
    console.log(req.session,"jjjjjjjjjjjjjjjjjjjjjjjjj");
   const orderData=await (await order.find({userId:req.session.userId}))
   console.log(orderData,"kkkkkkkkkkkkkkkkkkkkkkkkkk");

   res.render("orders",{orderData:orderData})
  } catch (error) {
    
  }
}

const load_addAddress = async (req, res) => {
  try {
    res.render("addAddress");
  } catch (error) {
    console.log(error.message);
  }
};

const addAddress = async (req, res) => {
  try {
    console.log(req.body);
    const {
      name,
      pinCode,
      locality,
      addressArea,
      district,
      state,
      landmark,
      mobile,
      locationType,
    } = req.body;

  
    // Check if the mobile number already exists in the database
    const userId=req.session.userId
    const existingUser = await user.findById(userId)
    if (existingUser.mobile==mobile) {
    res.render("addAddress", {
        message: "Please enter another mobile number",
      });
      return
    } else {
      let newAddress;
      if(locationType=="home"){
        newAddress = new address({
          user: req.session.userId,
          name: name,
          pinCode: pinCode,
          locality: locality,
          address: addressArea,
          district: district,
          state: state,
          landmark: landmark,
          alternatePhone: mobile,
          addressType: locationType,
          alternativePhone: mobile,
          default:true
        })
      }else{
           newAddress = new address({
            user: req.session.userId,
            name: name,
            pinCode: pinCode,
            locality: locality,
            address: addressArea,
            district: district,
            state: state,
            landmark: landmark,
            alternatePhone: mobile,
            addressType: locationType,
            alternativePhone: mobile,
          })
      }
      
      if (newAddress) {
        console.log(newAddress, "hhhhhhhhhhhhhhhhhhhhhhhhhhhh");
        const savedAddress = await newAddress.save();
        console.log("Address added successfully");
        return res.redirect("/profile");
      }
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const load_editAddress = async (req, res) => {
  try {
    const { addressId } = req.query;
    const userAddress = await address.findById({ _id: addressId });
    console.log(userAddress);
    if (userAddress) {
      res.render("AdressEdit", { userAddress: userAddress });
    } else {
      res.status(500), json("error happen");
    }
  } catch (error) {
    console.log(error.message);
  }
};


const addressDelete=async(req,res)=>{
  try {
    console.log("hello")
    console.log(req.body,":address id");
    const {Id}=req.body
    const deleteAddress=await address.findByIdAndDelete(Id)
    if(deleteAddress){
   res.json({status:true})
    }else{
      res.status(500).json("error")
    }
   
  } catch (error) {
    console.log(error.message)
  }
}

 const editAddress = async (req, res) => {
  try {
    console.log("pppppppppppppppppppppppppppppppppppppppp");
    console.log(req.body);
    const {
      name,
      pinCode,
      locality,
      addressArea,
      district,
      state,
      landmark,
      mobile,
      addressId,
    } = req.body;
    const updateAddress = await address.findByIdAndUpdate(
      { _id: addressId },
      {
        $set: {
          name: name,
          pinCode: pinCode,
          locality: locality,
          address: addressArea,
          district: district,
          state: state,
          landmark: landmark,
          alternatePhone: mobile,
        },
      },
      { new: true }
    );
    if (updateAddress) {
      res.redirect("/profile");
    } else {
      res.render("addressEdit", { message: "error happened" });
    }
  } catch (error) {
    console.log(error);
  }
};

const load_editProfile = async (req, res) => {
  try {
    console.log("hello");
    const { userId } = req.query;
    const userData = await user.findById({ _id: userId });
    console.log(userData, "from the userData");
    res.render("editUserData", { userData: userData });
  } catch (error) {
    console;
  }
};
const editProfile=async(req,res)=>{
  try {
    const userId=req.session.userId
    console.log(req.body);
    const {username,mobile}=req.body
    const userDataEdit=await user.findByIdAndUpdate({_id:userId},{$set:{
      username:username,
      mobile:mobile,
    }},{new:true})
    res.redirect("/profile")
  } catch (error) {
    console.log(error.message)
  }
}

// const changePassword= async(req,res)=>{
//   try {
//     console.log(req.body);
//     const {currentPassword,newPassword}=req.body
//     const {userId}= req.session
//     const userData=await user.findById({_id:userId})
//   const passwordMatch= await bcrypt.compare(currentPassword,userData.password)
//   console.log(passwordMatch,"compare");
//   if(passwordMatch==false){
//     return res.json({status:"invalid password"})
//   }
//   const hashPassword=await securePassword(newPassword)
//   console.log(hashPassword,"000000000000000000000000000000000000000000");
//   if(hashPassword){
//     console.log("Hlelo");
//     userData.password=hashPassword
//     await userData.save();
//     req.session.userId=null
//     req.session.user=false
//     return res.json({status:"password reset success"})
//   }

//   } catch (error) {
//     console.log(error.message)
//   }
  // 
// }


const changePassword = async (req, res) => {
  try {
    console.log("hello");
      const { currentPassword, newPassword } = req.body;
      const { userId } = req.session;
      console.log(currentPassword,newPassword)
      const userData = await user.findById(userId);
      console.log(userData,"userDAtea");

      if (!userData) {
          return res.status(404).json({ error: "User not found" });
      }

      
      const passwordMatch = await bcrypt.compare(currentPassword, userData.password);
      console.log(passwordMatch,":currentPassword");

      if (!passwordMatch) {
        console.log("inside password dismatch");
          return res.json({ status: "invalid password" });
      }

  
      const hashedPassword = await securePassword(newPassword);

      if (hashedPassword) {

          userData.password = hashedPassword;
          await userData.save();
          
      
          req.session.userId = null;
          req.session.user = false;

          return res.json({ status: "password reset success" });
      }
  } catch (error) {
      console.error("Error changing password:", error);
      return res.status(500).json({ error: "Internal server error" });
  }
};

const load_coupons=async(req,res)=>{
  try {
    console.log("hi");
    const {userId}=req.session
    console.log(userId);
    const coupons = await coupon.find({
      $and: [
        { listed: true },
        { user: { $nin: [userId] } } 
      ]
    });
    
    console.log(coupons);
    res.render("coupons",{couponData:coupons})
  } catch (error) {
    console.error(error)
  }
}

const load_transactions = async (req, res) => {
  try {
    const { userId } = req.session;
    const wallet = await Wallet.findOne({ user: userId }).populate("transactions");
    if (wallet) {
      res.render("transactions", { wallet: wallet });
    } else {
      res.render("transactions", { wallet: null });
    }
  } catch (error) {
    console.log(error.message);
    // Handle error
    res.status(500).send("Internal Server Error");
  }
}


module.exports = {
  load_profile,
  load_addAddress,
  addAddress,
  load_editAddress,
  addressDelete,
  editAddress,
  load_editProfile,
  editProfile,
  changePassword,
  load_order,
  load_coupons,
  load_transactions
};

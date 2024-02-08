const address = require("../model/address_model");
const user = require("../model/user_model");
const { session } = require("passport");
const { json } = require("express");

const load_profile = async (req, res) => {
  try {
    console.log(
      req.session.userId,
      "from the session in loginTTTTTTTTTTTTTTTTT"
    );

    const userData = await user.findById(req.session.userId);
    const userAddress=await address.findOne({user:req.session.userId})
    res.render("profile", { user: userData,userAddress:userAddress });
  } catch (error) {
    console.log(error.message);
  }
};

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

    console.log(req.session.userId, "it form session id");
    // Check if the mobile number already exists in the database
    const existingUser = await user.findOne({ mobile: mobile });
    console.log(existingUser, "existing user.................");
    if (existingUser) {
      return res.render("addAddress", { message: "Please enter another mobile number" });
    } else {
      const newAddress = new address({
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
      });
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

const load_editAddress=async (req,res)=>{
  try {
    
    const {addressId}=req.query
    const userAddress=await address.findById({_id:addressId})
    console.log(userAddress);
    if(userAddress){
      res.render("AdressEdit",{userAddress:userAddress})  
    }else{
      res.status(500),json("error happen")
    }
  } catch (error) {
    console.log(error.message)
  }
}


const editAddress=async(req,res)=>{
  try {
    console.log("pppppppppppppppppppppppppppppppppppppppp");
    console.log(req.body)
    const {name,pinCode,locality,addressArea,district,state,landmark,mobile,addressId}=req.body
    const updateAddress=await address.findByIdAndUpdate({_id:addressId},{$set:{
      name:name,
      pinCode:pinCode,
      locality:locality,
      address:addressArea,
      district:district,
      state:state,
      landmark:landmark,
      alternatePhone:mobile
    }},{new:true}
    )
    if(updateAddress){
      res.redirect('/profile')
    }else{
      res.render("addressEdit",{message:"error happened"})
    }
  } catch (error) {
    console.log(error)
  }
}

 const load_editProfile=async(req,res)=>{
  try {
    console.log("hello");
    res.send("helo")

const {userId}=req.query
console.log(userId,"ffffffffffffffffffffffff");
// const userData=await user.findOne({_id:userId})
// if(userData){
//   res.render("editProfile",{userData})
// }
  } catch (error) {
    
  }

}


module.exports = {
  load_profile,
  load_addAddress,
  addAddress,
  load_editAddress,
  editAddress,
  load_editProfile
};

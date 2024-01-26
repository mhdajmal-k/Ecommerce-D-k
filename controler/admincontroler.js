const user=require('../model/user_model')
const admin_model = require('../model/admin_model')
const { category } = require('../model/category')


//login page

const login_load=async(req,res)=>{
  try {
    res.render('adminLogin')
  } catch (error) {
    console.log(error.message)
  }
}
////////////////////////////////////////////////////////


//verification Login
const verify_login=async(req,res)=>{
  try {
    const {password,email} =req.body
      const adminEmail=await admin_model.findOne({email:email})

      if (adminEmail) {
        const adminPassword=await admin_model.findOne({password:password})
        if (adminPassword) {
          req.session.id=adminEmail._id
          console.log(req.session.id+"its form session id")
          res.redirect('/admin/dashboard')
        } else {
          res.render('adminLogin',{message:"password is incorrect!"}) 
        }
      } else {
        res.render('adminLogin',{message:"Incorrect Email!"})
      }
    
  } catch (error) {
    console.log(error.message);
  }
}


//dashboard

const Dashboard_load=async (req,res)=>{
  try {
    res.render('adminDashboard')
  } catch (error) {
    console.log(error.message)
  }
  }


//users list 

  const userLoad=async(req,res)=>{
    try {
      const userData=await user.find({})
      res.render("usersList",{users:userData})
    } catch (error) {
      console.log(error.message)
    }
  }


//userBlock and unblock

  const userBlockUnblock=async(req,res)=>{
    try {
   
      const {userId, status} = req.body
      if(status === "blockUser"){
        const block=await user.updateOne({_id:userId},{$set:{is_block:true}})
        res.json({status : true})
      }else if(status === "unblockUser"){
        const block=await user.updateOne({_id:userId},{$set:{is_block:false}})
        res.json({status : true})
      }else{
        console.log(error.message);
        res.json({status : false})
      }

      res.json({status : true})
      
    } catch (error) {
      console.error(error.message)
    }
  }

  //add product page

  const add_Product=(req,res)=>{
    try {
      res.render('addProduct')
    } catch (error) {
      console.log(error.message)
      
    }
   
  }

module.exports = {
  login_load,
  verify_login,
  Dashboard_load,
  userLoad,
  userBlockUnblock,
  add_Product,


};

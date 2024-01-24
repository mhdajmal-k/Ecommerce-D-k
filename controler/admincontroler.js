const user=require('../model/user_model')
const admin_model = require('../model/admin_model')



const login_load=async(req,res)=>{
  try {
    res.render('adminLogin')
  } catch (error) {
    console.log(error.message)
  }
}


const verify_login=async(req,res)=>{
  try {
    const {password,email} =req.body
  
      const adminEmail=await admin_model.findOne({email:email})
      console.log(`admin${adminEmail}`);
      if (adminEmail) {
        const adminPassword=await admin_model.findOne({password:password})
        console.log(`adming${adminPassword}`);

      
        if (adminPassword) {
          req.session.id=adminEmail._id
  
          res.redirect('/admin/dashboard')
          
        } else {
          res.render('adminLogin',{message:"password is incorrect!"})
          
        }
      } else {
        res.render('adminLogin',{message:"Incorrect Email!"})
      }
    
    console.log(password,email)
  } catch (error) {
    console.log(error.message);
  }
}

const Dashboard_load=async (req,res)=>{
  try {
    res.render('adminDashboard')
  } catch (error) {
    console.log(error.message)
  }
  }
  const userLoad=async(req,res)=>{
    try {
      console.log("hel;ooo");
      const userData=await user.find({})
      res.render("usersList",{users:userData})
    } catch (error) {
      console.log(error.message)
    }
  }





module.exports = {
  login_load,
  verify_login,
  Dashboard_load,
  userLoad
};

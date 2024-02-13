const user = require("../model/user_model");
const product = require("../model/product_model");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { render } = require("../router/user_routers");
const { sendMail } = require("./helper/nodemailer");

//secure Password

const securePassword = async (password) => {
  try {
    const hashPassword = await bcrypt.hash(password, 10);
    return hashPassword;
  } catch (error) {
    console.log(error.message);
  }
};

//generate OTP
const generateOTP = (length) => {
  let otp = "";

  for (let i = 0; i < length; i++) {
    const digit = Math.floor(Math.random() * 10);
    otp += digit.toString();
  }
  return otp;
};

//Home page

const landing_page = async (req, res) => {
  try {
  //   const email=req.user.displayName
  //   const name=req.user.emails
  // //  const i= req.user.username
  // //  const f=req.user.email
    // console.log(email,"form google");
    // console.log(name,"form google");
    console.log(  req.session.userId,'from the session in loginlllllllllllllll');
    const user=req.session.user || false
    console.log(user+"1");
    
  
    const products = await product
      .find({ isBlocked: false })
      .limit(8)
      .populate("categoryId");
if(user){
  res.render("landing_page", { products: products,user:user});

}else{
  res.render("landing_page", { products: products });

}
    // if (products&&user) res.render("landing_page", { products: products,user:user });
  } catch (error) {
    console.log(error.message);
  }
};



//Login page
const load_login = async (req, res) => {
  try {
    if(req.session.user==true){
      res.redirect('/')
    }
    res.render("login_page");
  } catch (error) {
    console.log(error.message);
  }
};



//signup page
const load_signup = async (req, res) => {
  try {
    res.render("signup");
  } catch (error) {
    console.log(error.message);
  }
};



//submit_signup
const submit_signup = async (req, res) => {
  try {
    const { email, username, mobile, password } = req.body;
    const existingUser = await user.findOne({
      $or: [{ email: email }, { mobile: mobile }],
    });
    if (!existingUser) {
      const securedPassword = await securePassword(password);
      req.session.userTemp  = { email, username, mobile, securedPassword };
      console.log(req.session.userTemp.email+"goted");
      const OTP = await generateOTP(6);
      req.session.OTP = OTP;
      console.log(OTP);
      const a = await sendMail(email, OTP);
      res.redirect("/otp_verification");
    } else {
      res.render("signup", { message: "User Already Existing..." });
    }
  } catch (error) {
    console.log(error.message);
  }
};



//load otp
const otp_verification = async (req, res) => {
  try {
    res.render("otp_page");
  } catch (error) {
    console.log(error.message);
  }
};



//resend otp
const resendOtp=async (req,res)=>{
  try {
    const newOtp = await generateOTP(6);
    console.log(newOtp+"new otp");
    req.session.OTP = newOtp;
    const sessionEmail=  req.session.userTemp.email
    const a = await sendMail(sessionEmail, newOtp);
    res.render("otp_page")
    
  } catch (error) {
    console.log(error.message)
  }
}



//otp checking...
const otp_submit = async (req, res) => {
  try {
    console.log("hellooooooooooooooooooo");
    const { otp } = req.body;

    console.log(otp, "from the ajax call");
    console.log(`session ${req.session.OTP}`);
  
    if (otp== req.session.OTP) {
      const { email, securedPassword, mobile, username } = req.session.userTemp;
      const saving_data = new user({
        username: username,
        email: email,
        mobile: mobile,
        password: securedPassword,
        is_verified: 1,
      });
      const userData = await saving_data.save();
       req.session.OTP=null
      if (userData) {
        res.json({ status: true });
      } 
    }else {
      res.json({ status: false });
    }
  } catch (error) {
    console.log(error.message);
  }
};




//user login
const verify_login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user_email = await user.findOne({ email: email });
    if (user_email) {
      const passwordMatch = await bcrypt.compare(password, user_email.password);
      if (passwordMatch) {
        if (user_email.is_verified == 1) {
          if (!user_email.is_block) {
            console.log(user_email._id,"from the ueremail idssssssssssssssss");

            req.session.userId= user_email._id;
            console.log(  req.session.userId,'from the session in loginddddddddddddddddd');
            req.session.user=true
            req.session.save()
            res.redirect("/");
          } else {
            res.render("login_page", { message: "oop! you have been blocked" });
          }
        } else {
          res.render("login_page", { message: "Please Verify email" });
        }
      } else {
        res.render("login_page", { message: "Invalid Password" });
      }
    } else {
      res.render("login_page", { message: "Invalid Email" });
    }
  } catch (error) {
    console.log(error.message);
  }
};



//get log page
const load_shop = async (req, res) => {
  console.log("heloo");
  try {
    const products = await product.find({ isBlocked: false }).populate("categoryId")
    res.render("shop", { product: products });
  } catch (error) {
    console.log(error.message);
  }
};




//one product details
const shopProduct = async (req, res) => {
  try {
   
    const { id } = req.query;
    const products = await product.findOne({ _id: id }).populate("categoryId");
    if(products ){
      const relatedProducts = await product.find({ _id: { $ne: id } }).populate({
        path: 'categoryId',
        match: { categoryTitle: 'categoryId' } 
    }).limit(4);
      res.render("viewOneproduct", { products,relatedProducts});
    } 
    else{
      res.send("oops!")
    }
  
  } catch (error) {
    console.log(error.message);
  }
};




//logout
const logout=async(req,res)=>{
  try {
   req.session.userId=null
   req.session.user=false
    res.redirect("/")
  } catch (error) {
    console.log(error.message)
  }
}




///FORGOT PASSWORD
const load_forgotPassword=async(req,res)=>{
  try {
    res.render("forgotPassword")
    
  } catch (error) {
    console.log(error.message)
  }
}


const forgotPassword=async(req,res)=>{
  try {
    const {email}=req.body
    console.log(email)
    const existingUser=await user.findOne({email:email})
    if(existingUser){
      const forgotPassword_OTP= await generateOTP(6);
      console.log(forgotPassword_OTP,"its the forgot password otp");
      req.session.forgotPassword_OTP=forgotPassword_OTP
      req.session.forgotPassword_email=email

      const a = await sendMail(email, forgotPassword_OTP);
      console.log("success");
      res.redirect("/forgotPassword_verify")
    }else{
      res.render("forgotPassword",{message:"invalid email please sign up"})
    }  
   // render('verifyForgotPassword')
  } catch (error) {
    console.log(error.message)
  }
}



//verifying forgot password
const  verify_forgotPassword=async(req,res)=>{
  try {
    console.log("Hello")
    res.render("verifyForgotPassword")
  } catch (error) {
    console.log(error.message);
  }
}



const resetPassword=async (req,res)=>{
  try {
    const {otp,newPassword,conformNewPassword}=req.body
    console.log(otp,newPassword,conformNewPassword);
    console.log(req.session?.forgotPassword_OTP);
    console.log(req.session.forgotPassword_email)
    const {forgotPassword_email}=req.session
  console.log(forgotPassword_email,"form session email");
    if( otp==req.session?.forgotPassword_OTP){
      if(newPassword==conformNewPassword){
console.log("success on this steps");
const hashedPassword=await securePassword(newPassword)
console.log(hashedPassword);
const updatePassword=await user.findOneAndUpdate({email:forgotPassword_email},{$set:{password:hashedPassword}})
if(updatePassword){
  req.session.forgotPassword_email=null
  req.session.forgotPassword_OTP=null
  res.redirect("\login")
}
      }else{
        res.render("verifyForgotPassword",{message:"Password is not Match"})
      }
    }else{
      res.render("verifyForgotPassword",{message:"invalid OTP"})
    }
  } catch (error) {
    console.log(error.message);
  }
}

  





module.exports = {
  landing_page,
  load_login,
  load_signup,
  submit_signup,
  otp_verification,
  otp_submit,
  verify_login,
  load_shop,
  shopProduct,
  resendOtp,
  logout,
  load_forgotPassword,
  forgotPassword, 
  verify_forgotPassword,
  resetPassword,  
};

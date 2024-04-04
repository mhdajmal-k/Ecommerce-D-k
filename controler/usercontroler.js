
const user = require("../model/user_model");
const product = require("../model/product_model");
const cart = require("../model/cart_model");
const category = require("../model/category");
const order = require("../model/order_model");
const Rating=require("../model/rating_model")
const wishList=require("../model/wishList")
const Wallet=require("../model/wallet")
const {Transaction}=require("../model/transaction")
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
// const { render, map } = require("../router/user_routers");
const { sendMail } = require("./helper/nodemailer");
const { pagination } = require("../controler/helper/pagination");
const { json } = require("express");
const { generateReferral } = require("../controler/helper/referalCode");


"use strict"

/////////////////////////////////secure Password//////////////////////////////////

    const securePassword = async (password) => {
      try {
        const hashPassword = await bcrypt.hash(password, 10);
        return hashPassword;
      } catch (error) {
        console.log(error.message);
      }
    };


///////////////////////////////////////////////////////



////////////////////////////////generate OTP/////////////////////////////////////
    const generateOTP = (length) => {
      let otp = "";
      for (let i = 0; i < length; i++) {
        const digit = Math.floor(Math.random() * 10);
        otp += digit.toString();
      }
      console.log(otp,"it  otp form the function")
      return otp;
    };
/////////////////////////////////////////////////////////////////////


/////////////////////////////////////Home page///////////////////////////////////

const landing_page = async (req, res) => {
  try {
    const user = req.session.user || false;
    const cartCount = await cart.find({}).count();
    console.log("cartCount:", cartCount);
    const products = await product
      .find({ isBlocked: false })
      .limit(8)
      .populate("categoryId");
    const newArrival = await product
      .find()
      .sort({
        createdAt: -1,
      })
      .limit(4);
      const categoryData= await category.find({})
      console.log(categoryData,"it the category");
    if (user) {
      res.render("landing_page", {
        products: products,
        user: user,
        newArrival: newArrival,
        cartCount,
        categoryData
      });
    } else {
      res.render("landing_page", {
        products: products,
        newArrival: newArrival,
        categoryData
      });
    }
    // if (products&&user) res.render("landing_page", { products: products,user:user });
  } catch (error) {
    console.log(error.message);
  }
};

//////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////Login page/////////////////////////////////////////
const load_login = async (req, res) => {
  try {
    if (req.session.user == true) {
      res.redirect("/");
    }
    res.render("login_page");
  } catch (error) {
    console.log(error.message);
  }
};

////////////////////////////////////////////////////////////////////


/////////////////////////////////////////signup page//////////////////////////////////
const load_signup = async (req, res) => {
  try {
    res.render("signup");
  } catch (error) {
    console.log(error.message);
  }
};

////////////////////////////////////////////////////////////////////////////


  
//////////////////////////////////////submit_signup/////////////////////////////////
const submit_signup = async (req, res) => {
  try {
    console.log("hihihihihih");
    console.log(req.body);
    const { email, username, mobile, password } = req.body; // Extract ref from req.body
    const existingUser = await user.findOne({ $or: [{ email: email }, { mobile: mobile }] });
    console.log(existingUser, "its checking.......");
    if (!existingUser) {
      const securedPassword = await securePassword(password);
      req.session.userTemp = { email, username, mobile, securedPassword };
      const OTP = generateOTP(6);
      console.log(OTP, "its otp");
      req.session.OTP = OTP;
    await sendMail(email, OTP);
      if (req.body.ref) {
        const checkingReferral = await user.findOne({ referral: req.body.ref });
        if (!checkingReferral) {
          return res.render("signup", { message: "Invalid referral code" });
        } else {
          const userId = checkingReferral._id;
          console.log(userId, "User ID");
          let wallet = await Wallet.findOne({ user: userId });
          if (!wallet) {
            wallet = new Wallet({
              user: userId,
              balance: 500,
              transactions: []
            });
          } else {
            wallet.balance += 500;
          }
          const transaction = new Transaction({
            user: userId,
            amount: 500,
            type: "Referral",
            description: `Referral Reward by ${username}`
          });
          wallet.transactions.push(transaction._id);
          await Promise.all([transaction.save(), wallet.save()]);
        }
      }
      res.redirect("/otp_verification");
    } else {
      res.render("signup", { message: "User already exists" });
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
};

///////////////////////////////////////////////////////////////////

////////////////////////////////load otp
const otp_verification = async (req, res) => {
  try {
    console.log("JI");
    console.log(req.session);
    res.render("otp_page");
  } catch (error) {
    console.log(error.message);
  }
};
///////////////////////////////////////


////////////////////////////////resend otp
const resendOtp = async (req, res) => {
  try {
    const newOtp = await generateOTP(6);
    console.log(newOtp + "new otp");
    req.session.OTP = newOtp;
    const sessionEmail = req.session.userTemp.email;
    const send = await sendMail(sessionEmail, newOtp);
    res.render("otp_page");
  } catch (error) {
    console.log(error.message);
  }
};
/////////////////////////////////////

////////////////////////////////otp checking...
const otp_submit = async (req, res) => {
  try {
    const { otp } = req.body;
    // console.log(otp, "from the ajax call");
    // console.log(`session ${req.session.OTP}`);
    if (otp == req.session.OTP) {
      const { email, securedPassword, mobile, username } = req.session.userTemp;
      const referralCode = generateReferral(6);
      const saving_data = new user({
        username: username,
        email: email,
        mobile: mobile,
        password: securedPassword,
        is_verified: 1,
      referral:referralCode
      });
      const userData = await saving_data.save();
      req.session.OTP = null;
      if (userData) {
        res.json({ status: true });
      }
    } else {
      res.json({ status: false });
    }
  } catch (error) {
    console.log(error.message);
  }
};
////////////////////////////////////////////////

/////////////////////user login
const verify_login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user_email = await user.findOne({ email: email });
    if (user_email) {
      const passwordMatch = await bcrypt.compare(password, user_email.password);
      if (passwordMatch) {
        if (user_email.is_verified == 1) {
          if (!user_email.is_block) {
            req.session.userId = user_email._id;
            req.session.user = true;
            req.session.save();
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
///////////////////////////////////////////////////////

/////////////////////////////////////get log page
const load_shop = async (req, res) => {
  try {
    const productCount = await product.find().count();
    const page = req.query.page || 1;
    const pagesize = 8;
    const skip = (page - 1) * pagesize;
    const totalPage = Math.ceil(productCount / pagesize);
    const products = await product
      .find({ isBlocked: false })
      .populate("categoryId")
      .skip(skip)
      .limit(pagesize);
    const categories = await category.find();
    res.render("shop", {
      product: products,
      totalPage,
      currentPage: page,
      categories,
      category:''
    });
  } catch (error) {
    console.log(error.message);
  }
};

////////////////////////////////////////////////////



////////////////////////one product details
const shopProduct = async (req, res) => {
  try {
    const { id } = req.query;
    const products = await product.findOne({ _id: id }).populate("categoryId");
    const relatedProducts = await product
          .find({ _id: { $ne: id } })
          .populate({
            path: "categoryId",
            match: { categoryTitle: "categoryId" },
          })
          .limit(4);
          const reviews= await Rating.find({productId:id}).populate("userId")
          console.log(reviews);
          
    if (req.session.userId) {
      const { userId } = req.session;

      const orderData = await order.find({ userId: userId });
      const checkingOrderedProduct = orderData.some((order) => {
        return order.items.some(
          (item) =>
            item.product.toString() === id && order.status === "Delivered"
        );
      });
      if (products) {  
        if (checkingOrderedProduct) {
          res.render("viewOneproduct", { products, relatedProducts, checkingOrderedProduct,reviews });
        } else {
          res.render("viewOneproduct", { products, relatedProducts,reviews });
        }
      } else {
        res.send("Product not found");
      }
    } else {
      res.render("viewOneproduct", { products, relatedProducts,reviews});
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).render("serverError")
  }
};
//////////////////////////////////////

///////////////////////logout
const logout = async (req, res) => {
  try {
    req.session.userId = null;
    req.session.user = false;
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};
///////////////////////////////////


////////////////FORGOT PASSWORD
const load_forgotPassword = async (req, res) => {
  try {
    res.render("forgotPassword");
  } catch (error) {
    console.log(error.message);
  }
};
//////////////////////////////////


///////////////////////
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);
    const existingUser = await user.findOne({ email: email });
    if (existingUser) {
      const forgotPassword_OTP = await generateOTP(6);
      console.log(forgotPassword_OTP, "its the forgot password otp");
      req.session.forgotPassword_OTP = forgotPassword_OTP;
      req.session.forgotPassword_email = email;
      const a = await sendMail(email, forgotPassword_OTP);
      res.redirect("/forgotPassword_verify");
    } else {
      res.render("forgotPassword", { message: "invalid email please sign up" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
//////////////////////////////////////


//verifying forgot password
const verify_forgotPassword = async (req, res) => {
  try {
    res.render("verifyForgotPassword");
  } catch (error) {
    console.log(error.message);
  }
};
///////////////////////////////////////////////////


const resetPassword = async (req, res) => {
  try {
    const { otp, newPassword, conformNewPassword } = req.body;
    console.log(otp, newPassword, "form reset password");
    console.log(req.session?.forgotPassword_OTP);
    console.log(req.session.forgotPassword_email);
    const { forgotPassword_email } = req.session;
    console.log(forgotPassword_email, "form session email");
    if (otp == req.session?.forgotPassword_OTP) {
      if (newPassword == conformNewPassword) {
        const hashedPassword = await securePassword(newPassword);
        console.log(hashedPassword);
        const updatePassword = await user.findOneAndUpdate(
          { email: forgotPassword_email },
          { $set: { password: hashedPassword } }
        );
        if (updatePassword) {
          req.session.forgotPassword_email = null;
          req.session.forgotPassword_OTP = null;
          res.json({ status: "password updated" });
        }
      } else {
        res.json({ status: "Password is not Match" });
      }
    } else {
      res.json({ status: "invalid OTP" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//////////////////////////////////////////////
const browsCategory = async (req, res) => {
  try {
    console.log(req.query);
    const { categoryId,filter } = req.query;
    const { skip, page, pageSize, totalPage } = await pagination(req, res);
    let categorySort;
    if(filter !=""&&categoryId!=""){ 
      console.log("hihih");
      if(filter == 'lowtohigh'){
        console.log("inside the low to high");
        categorySort = await product.find({ categoryId: categoryId }).sort({ sellingPrice: 1 })
        .skip(skip)
        .limit(pageSize);;
        console.log(categorySort );
      }else if(filter == 'highToLow'){
        console.log("inside the HightoLow");
        categorySort = await product.find({ categoryId: categoryId }).sort({ sellingPrice: -1 })
        .skip(skip)
        .limit(pageSize);;
        console.log(categorySort);
      }else if(filter == 'newArrival'){
        console.log("inside the arrival");
        categorySort = await product.find({ categoryId: categoryId }).sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(pageSize);;
      }else if(filter == 'averageRating'){
        console.log("inside the rat");

        categorySort = await product.find({ categoryId: categoryId }).sort({rating:-1})
        .skip(skip)
        .limit(pageSize);;
      }else if(filter == 'accedingOrder'){
        console.log("inside the asce");

        categorySort = await product.find({ categoryId: categoryId }).sort({ productName: 1 })
        .skip(skip)
        .limit(pageSize);;
      }else if(filter == 'descendingOrder'){
        console.log("inside the desc");

        categorySort = await product.find({ categoryId: categoryId }) .sort({ productName: -1 })
        .skip(skip)
        .limit(pageSize);;
      }
      else{
        categorySort = await product.find({ categoryId: categoryId })
      }
    }else{
      console.log("inside");
      if(filter == 'lowtohigh'){
        console.log("LOWTO HIGH");
        categorySort = await product.find().sort({ sellingPrice: 1 })
        .skip(skip)
        .limit(pageSize);;
      }
      if(filter == 'highToLow'){
        categorySort = await product.find().sort({ sellingPrice: -1 })
        .skip(skip)
        .limit(pageSize);;
      }
      if(filter == 'newArrival'){
        categorySort = await product.find().sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(pageSize);;
      }
      if(filter == 'averageRating'){
        categorySort = await product.find().sort({rating:-1})
        .skip(skip)
        .limit(pageSize);;
      }
      if(filter == 'accedingOrder'){
        categorySort = await product.find().sort({ productName: 1 })
        .skip(skip)
        .limit(pageSize);;
      }
      if(filter == 'descendingOrder'){
        categorySort = await product.find() .sort({ productName: -1 })
        .skip(skip)
        .limit(pageSize);;
      }
    }
    const categories = await category.find();
    console.log("///////////////////////////////////");
    console.log(categorySort,"it inside ");
    res.render("shop", {
      product: categorySort,
      totalPage,
      currentPage: page,
      categories,
      category:categoryId
    });
  } catch (error) {
    console.log(error);
  }
};



//////////////////////////////////////////

const Load_WishList = async (req, res) => {
  try {
    const userId=req.session.userId
    const product=await wishList.findOne({userId:userId}).populate("items.productId")
    console.log(product);
    res.render("wishlist",{product:product})
  } catch (error) {
  console.log(error.message)
  }
};

///////////////////////////////////////

const submitReview = async (req, res) => {
  try {
      const { userId } = req.session;
      const { comment, rating, productID } = req.body;
      // Check if the user has already reviewed the product
      const alreadyReviewed = await Rating.findOne({ userId: userId, productId: productID });
      if (alreadyReviewed) {
          return res.status(300).json({ message: "already reviewed" });
      }
      const ratingProduct = new Rating({
          userId: userId,
          productId: productID,
          rating: rating,
          review: comment
      });
      await ratingProduct.save();
    const review=await Rating.find({productId:productID})
  let  totalReview=0
    review.forEach((rating) => {
      totalReview += rating.rating;
    });
  const productRating = Math.round(totalReview / review.length);
  const ReviewCount=review.length
  await product.findOneAndUpdate(
    { _id: productID },
    { 
      $set: { rating: productRating },
      $inc: { totalReview: ReviewCount }
    },
    { new: true }
  );
      res.status(201).json({ message: "review added" });
  } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: "Internal server error" });
  }
};
///////////////////////////////////////////

///////////////////////////////////////

 const removeReview=async(req,res)=>{
  try {
    console.log(req.body);
    const {id}=req.body
    const removeReview=await Rating.findByIdAndDelete(id)
    if(removeReview){
      res.status(200).json("review removed")
    }
  } catch (error) {
    console.error(error)
  }
 }

//////////////////////////////////////////
 const removeFromWishList=async(req,res)=>{
  try {
    const {userId}=req.session
    const{productId}=req.body
    const userWishlist=await wishList.findOneAndUpdate({userId:userId},{$pull:{items:{productId:productId}}})
    if(userWishlist){
      res.json({status:true})
      return
    }
  } catch (error) {
    
  }
 }
////////////////////////////////////


 const add_ToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const { userId } = req.session;
        if (!userId) {
            res.json({ status: "invalid User" });
            return;
        }
        let userWishlist = await wishList.findOne({ userId: userId })
        if (!userWishlist) {
            userWishlist = new wishList({
                userId: userId,
                items: []
            });
            console.log("here ok");
        }
        
        console.log("checking loaded");
        const alreadyAddedIndex = userWishlist.items.findIndex(item => item.productId.toString() === productId.toString());
        console.log(alreadyAddedIndex);
        
        if (alreadyAddedIndex !== -1) {
            res.json({ status: "already added" });
            return;
        }
        userWishlist.items.push({ productId: productId });
        await userWishlist.save();
        
        res.json({ status: "add to wishlist" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
//////////////////////////////////////

///////////////////////////////////////
const searchProduct = async (req, res) => {
  try {
  const { productData } = req.body;
      if (productData && productData.length > 0) {
          const searchingProduct = await product.find({ productName: { $regex: new RegExp(productData, 'i') } });
          if (searchingProduct && searchingProduct.length > 0) {
              res.json({ status: true, searchingProduct });
          } else {
              res.json({ status: false, messageNoProduct: "No matching products found" });
          }
      } else {
          res.json({ status: false, message: "NO PRODUCT" });
      }
  } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ status: false, message: "Internal server error" });
  }
};


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
  browsCategory,
  Load_WishList,
  add_ToWishlist,
  submitReview,
  removeReview,
  removeFromWishList,
  searchProduct
};

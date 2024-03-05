"use strict";
const user = require("../model/user_model");
const product = require("../model/product_model");
const cart = require("../model/cart_model");
const category = require("../model/category");
const order = require("../model/order_model");
const Rating=require("../model/rating_model")
const wishList=require("../model/wishList")
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { render, map } = require("../router/user_routers");
const { sendMail } = require("./helper/nodemailer");

const { pagination } = require("../controler/helper/pagination");
const { json } = require("express");

("use strict");

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
    if (user) {
      res.render("landing_page", {
        products: products,
        user: user,
        newArrival: newArrival,
        cartCount,
      });
    } else {
      res.render("landing_page", {
        products: products,
        newArrival: newArrival,
        cartCount,
      });
    }
    // if (products&&user) res.render("landing_page", { products: products,user:user });
  } catch (error) {
    console.log(error.message);
  }
};

//Login page
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
      req.session.userTemp = { email, username, mobile, securedPassword };
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

//otp checking...
const otp_submit = async (req, res) => {
  try {
    const { otp } = req.body;
    // console.log(otp, "from the ajax call");
    // console.log(`session ${req.session.OTP}`);
    if (otp == req.session.OTP) {
      const { email, securedPassword, mobile, username } = req.session.userTemp;
      const saving_data = new user({
        username: username,
        email: email,
        mobile: mobile,
        password: securedPassword,
        is_verified: 1,
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

//get log page
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
    });
  } catch (error) {
    console.log(error.message);
  }
};

const lowtohigh = async (req, res) => {
  try {
    console.log("hello");
    const { skip, page, pageSize, totalPage } = await pagination(req, res);
    const lowToHigh = await product
      .find()
      .sort({ sellingPrice: 1 })
      .skip(skip)
      .limit(pageSize);
    const categories = await category.find();
    res.render("shop", {
      product: lowToHigh,
      totalPage,
      currentPage: page,
      categories,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};

const highToLow = async (req, res) => {
  try {
    const { skip, page, pageSize, totalPage } = await pagination(req, res);
    const lowToHighProduct = await product
      .find()
      .sort({ sellingPrice: -1 })
      .skip(skip)
      .limit(pageSize);
    const categories = await category.find();
    res.render("shop", {
      product: lowToHighProduct,
      totalPage,
      currentPage: page,
      categories,
    });
  } catch (error) {
    console.log(error.message);
  }
};


const newArrival = async (req, res) => {
  try {
    const { skip, page, pageSize, totalPage } = await pagination(req, res);
    const newArrival = await product
      .find()
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(pageSize);
    const categories = await category.find();
    res.render("shop", {
      product: newArrival,
      totalPage,
      currentPage: page,
      categories,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//one product details
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
      res.render("viewOneproduct", { products, relatedProducts,reviews });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};


//logout
const logout = async (req, res) => {
  try {
    req.session.userId = null;
    req.session.user = false;
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

///FORGOT PASSWORD
const load_forgotPassword = async (req, res) => {
  try {
    res.render("forgotPassword");
  } catch (error) {
    console.log(error.message);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);
    const existingUser = await user.findOne({ email: email });
    console.log(existingUser, "its existing user");
    if (existingUser) {
      const forgotPassword_OTP = await generateOTP(6);
      console.log(forgotPassword_OTP, "its the forgot password otp");
      req.session.forgotPassword_OTP = forgotPassword_OTP;
      req.session.forgotPassword_email = email;
      const a = await sendMail(email, forgotPassword_OTP);
      console.log("success");
      res.redirect("/forgotPassword_verify");
    } else {
      res.render("forgotPassword", { message: "invalid email please sign up" });
    }
    // render('verifyForgotPassword')
  } catch (error) {
    console.log(error.message);
  }
};

//verifying forgot password
const verify_forgotPassword = async (req, res) => {
  try {
    res.render("verifyForgotPassword");
  } catch (error) {
    console.log(error.message);
  }
};

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
const browsCategory = async (req, res) => {
  try {
    console.log(req.query);
    const { categoryId } = req.query;
    const { skip, page, pageSize, totalPage } = await pagination(req, res);
    const categorySort = await product.find({ categoryId: categoryId });
    const categories = await category.find();
    res.render("shop", {
      product: categorySort,
      totalPage,
      currentPage: page,
      categories,
    });
  } catch (error) {
    console.log(error);
  }
};
const accedingOrder = async (req, res) => {
  try {
    const accedingOrderProduct = await product
      .find({})
      .sort({ productName: 1 });
    const { skip, page, pageSize, totalPage } = await pagination(req, res);
    const categories = await category.find();
    res.render("shop", {
      product: accedingOrderProduct,
      totalPage,
      currentPage: page,
      categories,
    });
  } catch (error) {
    console.error(error.message);
  }
};
const descendingOrder = async (req, res) => {
  try {
    const accedingOrderProduct = await product
      .find({})
      .sort({ productName: -1 });
    const { skip, page, pageSize, totalPage } = await pagination(req, res);
    const categories = await category.find();
    res.render("shop", {
      product: accedingOrderProduct,
      totalPage,
      currentPage: page,
      categories,
    });
  } catch (error) {
    console.error(error.message);
  }
};

const averageRating=async(req,res)=>{
  try {
    console.log("hi ");
    const averageRatingProduct=await product.find({}).sort({rating:-1})
    console.log(averageRatingProduct,"ok");
       const { skip, page, pageSize, totalPage } = await pagination(req, res);
    const categories = await category.find();
    res.render("shop", {
      product: averageRatingProduct,
      totalPage,
      currentPage: page,
      categories,
    });
  } catch (error) {
    console.log(error)
  }
}

const Load_WishList = async (req, res) => {
  console.log("hello");
  try {
    const userId=req.session.userId
    const product=await wishList.findOne({userId:userId}).populate("items.productId")
    console.log(product);
    res.render("wishlist",{product:product})
  } catch (error) {
  console.log(error.message)
  }
};


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
 const removeFromWishList=async(req,res)=>{
  try {
    console.log("hi");
    const {userId}=req.session
    const{productId}=req.body
    console.log(userId);
    console.log(productId);
    const userWishlist=await wishList.findOneAndUpdate({userId:userId},{$pull:{items:{productId:productId}}})
    if(userWishlist){
      res.json({status:true})
      return
    }
  } catch (error) {
    
  }
 }


 const add_ToWishlist = async (req, res) => {
    try {
        console.log("HI");
        console.log(req.body);
        const { productId } = req.body;
        const { userId } = req.session;
        
        if (!userId) {
            res.json({ status: "invalid User" });
            return;
        }
        
        let userWishlist = await wishList.findOne({ userId: userId });
        
        console.log("hi");
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



const searchProduct=async(req,res)=>{
  try {
    console.log("hi");
    console.log(req.body.product);
  } catch (error) {
    console.log(error)
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
  lowtohigh,
  highToLow,
  newArrival,
  shopProduct,
  resendOtp,
  logout,
  load_forgotPassword,
  forgotPassword,
  verify_forgotPassword,
  resetPassword,
  browsCategory,
  accedingOrder,
  descendingOrder,
  Load_WishList,
  add_ToWishlist,
  submitReview,
  removeReview,
  removeFromWishList,
  averageRating,
  searchProduct
};

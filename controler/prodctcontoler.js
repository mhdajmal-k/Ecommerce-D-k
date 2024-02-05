
const { errorMonitor, consumers } = require('nodemailer/lib/xoauth2');
const category = require('../model/category');
const product=require('../model/product_model');
const { rawListeners, findByIdAndDelete } = require('../model/user_model');
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);
const path= require('path')
//product page  

const load_products=async(req,res)=>{
  try {  const productData=await product.find({}).populate("categoryId")
    res.render('productList',{products:productData})
    
  } catch (error) {
    console.log(error.message)
  }
}

//============================== addProduct page+===========================

const add_ProductLoad=async(req,res)=>{
    try {
      
      const categories=await category.find({isList:true})

      console.log(categories+"from addproduct");
      res.render('addProduct',{category:categories})
    } catch (error) {
      console.log(error.message) 
    }
  }

//============================== addProduct page+===========================

const add_Product=async(req,res)=>{
  try {
    const images = [];
                if (req.files && req.files.length > 0) {
                    for (let i = 0; i < req.files.length; i++) {
                        images.push(req.files[i].filename);
                      }}
    if(req.body){     
    const { productId, productName, color, size,quantity, price, sellingPrice,description,categories}=req.body
      const productNameExist=await product.findOne({productName:{$regex:new RegExp('^'+productName+"$","i")}})
      const newProduct= new product({
        productId:productId,
        productName:productName,
        description:description,
        color:color,
        price:price,
        size:size,
        quantity:quantity,
        sellingPrice:sellingPrice,
        image:images,
        categoryId:categories
    })

      if(productNameExist){
        if(productNameExist.size==size){
           res.render("addProduct",{message:"product Id already exists1!"})
        }else{
        await newProduct.save()
        res.redirect('/admin/addProduct')
      }
    }else{
      await newProduct.save()
      res.redirect('/admin/addProduct')
    }
    }else{
      res.send(400).json("invalid request")
    }
  } catch (error) {
    console.log(error)
  }
}



// product edit page

const load_editProduct=async(req,res)=>{
  try {
    const id=req.query.procductID
    if(id){
const productData=await product.findById(id)
const categories=await category.find({})
res.render("editProducts",{products:productData,categories:categories})
    }else{
      res.status(400),json("error")
    }

  } catch (error) {
    console.log(error.message)
  }
}


//post edit

const editProduct=async (req,res)=>{
  try {
  
    const images = [];
    if (req.files && req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
            images.push(req.files[i].filename);
          }}
  const {productId,productName,color,size,quantity,price,sellingPrice,id,description,categories}=req.body
const updateProduct=await product.findByIdAndUpdate({_id:id},{$set:{
  productId:productId,
  productName:productName,
  color:color,
  size:size,
  quantity:quantity,
  price:price,
  sellingPrice:sellingPrice,
  description:description,
  categoryId:categories,
  image:images
}})
if(updateProduct){
  console.log("done");
  res.redirect("/admin/products")
}else{

  res.render('editProducts',{message:"some error happen"})
}
  } catch (error) {
    console.log(error.message)
  }
}


//list products
const listAndUnListProduct=async (req,res)=>{
  try {
    const {productId,status}=req.body
    if(status==="block"){
      const block=await product.findOneAndUpdate({_id:productId},{$set:{
        isBlocked:true
      }})
      res.json({status:true})
    }else{
      const unblock=await product.findOneAndUpdate({_id:productId},{$set:{
        isBlocked:false
      }})
      res.json({status:true})
    }
  } catch (error) {
    console.log(error.message+"hello4")
  }
}


//delete product

const delete_product=async (req,res) =>{
  try {
    const id=req.params.id
    if(id){
      const delete_products=await  product.findByIdAndDelete(id)
      if(delete_products){
        console.log("success");
        res.redirect("/admin/products")
      }
  
  }else{
    res.render("editProduct",{message:"error happened"})
  }

  } catch (error) {
    console.log(error.message)
  }
}

const delete_image=async(req,res)=>{
  try {
    console.log("HEllo form delete image");
   
    console.log( req.body.imageId,'this is img id LLLLLLL')
   
    const {imageId,productId}=req.body
    const products = await product.findByIdAndUpdate(productId, {
      $pull: { image: imageId }
    });
    const imagePath = path.join('uploads', 'products', imageId);
    await unlinkAsync(imagePath);
     console.log(products,'TTTTTTT');
    if(products){
      res.json({status:true})
    }
    
    
  } catch (error) {
    console.log(error.message)
  }
}
  

  module.exports={
    add_ProductLoad,
    add_Product,
    load_products,
    load_editProduct,
    editProduct,
    listAndUnListProduct,
    delete_product,
    delete_image
  }
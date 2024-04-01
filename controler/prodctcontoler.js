"use strict";
const { errorMonitor, consumers } = require("nodemailer/lib/xoauth2");
const category = require("../model/category");
const product = require("../model/product_model");

const { rawListeners, findByIdAndDelete } = require("../model/user_model");
const fs = require("fs");
const { promisify } = require("util");
const randomId = require("../controler/helper/randomId");
const unlinkAsync = promisify(fs.unlink);
const path = require("path");
const { log, count } = require("console");
const { render } = require("../router/admin_routers");

//product page

const load_products = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 8;
    const skip = (page - 1) * limit;
    const productCount = await product.find({ isBlocked: false }).countDocuments();
    const totalPage = Math.ceil(productCount / limit);
    const productData = await product.find({}).populate("categoryId").skip(skip).limit(limit);

    res.render("productList", { products: productData,totalPage,
      currentPage: page });
  } catch (error) {
    console.log(error.message);
  }
};

//============================== addProduct page+===========================

const add_ProductLoad = async (req, res) => {
  try {
    // console.log(randomId());
    const categories = await category.find({ isList: true });
    res.render("addProduct", { category: categories });
  } catch (error) {
    console.log(error.message);
  }
};

//============================== addProduct page+===========================

const add_Product = async (req, res) => {
  try {
    const images = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        images.push(req.files[i].filename);
      }
    }
    if (req.body) {
      const {
        productName,
        color,
        sizeS,
        sizeM,
        sizeL,
        sizeXL,
        price,
        sellingPrice,
        description,
        categories,
      } = req.body;
      console.log(randomId());
      const productNameExist = await product.findOne({
        productName: { $regex: new RegExp("^" + productName + "$", "i") },
      });
      // const exitingColor=await product.findOne({productName:productName,color:color})
      const newProduct = new product({
        productId: randomId(),
        productName: productName,
        description: description,
        color: color,
        price: price,
        sellingPrice: sellingPrice,
        image: images,
        categoryId: categories,
        size: [
          {
            size: "S",
            quantity: sizeS,
          },
          {
            size: "M",
            quantity: sizeM,
          },
          {
            size: "L",
            quantity: sizeL,
          },
          {
            size: "XL",
            quantity: sizeXL,
          },
        ],
      });
      if (productNameExist) {
        const categories = await category.find({ isList: true });
        res.render("addProduct", {
          message: "product  already exists1!",
          category: categories,
        });
      } else {
        await newProduct.save();
        res.redirect("/admin/addProduct");
      }
    } else {
      res.send(400).json("invalid request");
    }
  } catch (error) {
    console.log(error);
  }
};

// product edit page

const load_editProduct = async (req, res) => {
  try {
    const id = req.query.procductID;
    if (id) {
      const productData = await product.findById(id);
      const categories = await category.find({});
      res.render("editProducts", {
        products: productData,
        categories: categories,
      });
    } else {
      res.status(400), json("error");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//post edit

const editProduct = async (req, res) => {
  try {
    const {
      productId,
      productName,
      color,
      sizeS,
      sizeM,
      sizeL,
      sizeXL,
      price,
      sellingPrice,
      id,
      description,
      categories,
    } = req.body;
    if (req.files && req.files.length > 0) {
      const images = req.files.map((file) => file.filename);

      const updatedProduct = await product.updateOne(
        { productId: productId },
        { $push: { image: { $each: images } } }
      );
    }

    const updateProduct = await product.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          productId: productId,
          productName: productName,
          color: color,
          price: price,
          sellingPrice: sellingPrice,
          description: description,
          categoryId: categories,
          size: [
            {
              size: "S",
              quantity: sizeS,
            },
            {
              size: "M",
              quantity: sizeM,
            },
            {
              size: "L",
              quantity: sizeL,
            },
            {
              size: "XL",
              quantity: sizeXL,
            },
          ],
        },
      }
    );
    if (updateProduct) {
      res.redirect("/admin/products");
    } else {
      res.render("editProducts", { message: "some error happen" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//list products
const listAndUnListProduct = async (req, res) => {
  try {
    const { productId, status } = req.body;
    if (status === "block") {
      const block = await product.findOneAndUpdate(
        { _id: productId },
        {
          $set: {
            isBlocked: true,
          },
        }
      );
      res.json({ status: true });
    } else {
      const unblock = await product.findOneAndUpdate(
        { _id: productId },
        {
          $set: {
            isBlocked: false,
          },
        }
      );
      res.json({ status: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//delete product

const delete_product = async (req, res) => {
  try {
    const id = req.params.id;
    if (id) {
      const delete_products = await product.findByIdAndDelete(id);
      if (delete_products) {
        res.redirect("/admin/products");
      }
    } else {
      res.render("editProduct", { message: "error happened" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//delete image
const delete_image = async (req, res) => {
  try {
    const { imageId, productId } = req.body;
    const products = await product.findByIdAndUpdate(productId, {
      $pull: { image: imageId },
    });
    const imagePath = path.join("uploads", "products", imageId);
    console.log("IMAGE pATH:", imagePath);
    await unlinkAsync(imagePath);
    if (products) {
      res.json({ status: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const productOffer = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 8;
    const skip = (page - 1) * limit;
    const productCount = await product.find({ isBlocked: false }).countDocuments();
    const totalPage = Math.ceil(productCount / limit);
    const allProduct = await product.find({ isBlocked: false }).skip(skip).limit(limit)
    res.render("productOffer", {
      allProduct,
      totalPage,
      currentPage: page
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};


const addingOffer = async (req, res) => {
  try {
      const { productId, offerPrice } = req.body;
      
      if (!productId || !offerPrice || isNaN(offerPrice) || offerPrice < 0) {
        console.log("hi");
          return res.json({message: "Invalid input" });
      }
      const productData = await product.findById(productId);
      if (!productData) {
          return res.status(404).json({  message: "Product not found" });
      }
      const maximum=productData.price*60/100
      console.log(maximum);
      if (offerPrice > productData.price) {
          return res.json({  message: "Offer price should not exceed regular price" });
      }
      if (offerPrice < maximum) {

          return res.json({  message: "maximum offer exceed you have to limit(500) fo regular price" });
      }
      const updatedProduct = await product.findByIdAndUpdate(productId, { $set: { sellingPrice: offerPrice,productOffer:offerPrice } });
      if (updatedProduct) {
          return res.json({ status: true, message: "Offer activated successfully" });
      } else {
          return res.status(500).json({ status: false, message: "Failed to activate offer" });
      }
  } catch (error) {
      console.error(error.message);
      return res.status(500).json({  message: "Internal server error" });
  }
}

const categoryOffer = async (req, res) => {
  try {
    const categories = await category.find({ isList: true });
    

    res.render("categoryOffer", { categories });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error");
  }
};


const applyCategoryOffer = async (req, res) => {
  try {
    console.log(req.body); 
    const { categoryId, offerPrice } = req.body;
    const categoryData = await category.findById(categoryId);
    if (!categoryData) {
      return res.status(404).json({ message: 'Category not found' });
    }
    categoryData.offerPrice = offerPrice;
    await categoryData.save();
    const products = await product.find({ categoryId: categoryId });
    for (const product of products) {
      console.log(product);
      const categoryPercentage = Math.ceil(product.price * (1 - categoryData.offerPrice/ 100))
      console.log("/////////////////////////////////////////////////");
      console.log(product.sellingPrice,"it the selling price");
      console.log("///////////////////////////////");
      console.log(categoryPercentage);
      if(product.sellingPrice>categoryPercentage){
        product.sellingPrice = categoryPercentage;
        product.offerApplied = true;
        await product.save();
      }else{
      
        product.sellingPrice = product.productOffer??product.price
        product.offerApplied = true;
        await product.save();
      }
    }
    return res.status(200).json({ message: 'Category offer applied successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};






module.exports = {
  add_ProductLoad,
  add_Product,
  load_products,
  load_editProduct,
  editProduct,
  listAndUnListProduct,
  delete_product,
  delete_image,
  productOffer,
  addingOffer,
  categoryOffer,
  applyCategoryOffer

};

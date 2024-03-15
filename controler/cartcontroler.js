"use strict";
const cart = require("../model/cart_model");
const user = require("../model/user_model");
const product = require("../model/product_model");

//////////////////////////cart page //////////////////////

const load_cart = async (req, res) => {
  const users = req.session.userId;
  const userCart = await cart.findOne({ userId: users }).populate({
    path: "items.productId",
    populate: {
      path: "categoryId",
      model: "categories",
    },
  });
  if (userCart) {
    console.log("hhiihihihihihih");
    let cartsInd = [];
    userCart.items.forEach((el) => {
      const index = el.productId.size.findIndex(
        (element) => element.size === el.size
      );
      console.log(index,"it checking................");
      const qty = el.productId.size[index].quantity;
      console.log(index);
      console.log(qty);
      if (el.quantity > qty) {
        el.quantity = qty;
      }
      if (el.quantity === 0) {
        const cartIndex = userCart.items.findIndex(
          (index) => index.quantity === el.quantity
        );
        console.log(cartIndex);
        cartsInd.push(cartIndex);
      }
    });
    cartsInd.forEach((carts) => {
      userCart.items.splice(carts, 1);
      cartsInd.forEach((el) => el--);
    });
    userCart.save();
    console.log(userCart, "llllllllllllllllllllllllllll");
  }
  // const selectedSize = productData.size.find((item) => item.size === size);
  if (userCart) {
    const productIdsInCart = userCart.items.map((item) => item.productId._id);
    const randomProduct = await product.aggregate([
      { $match: { _id: { $nin: productIdsInCart } } },
      { $sample: { size: 4 } },
    ]);
    res.render("cart", { cart: userCart, relatedProducts: randomProduct });
  } else {
    res.render("cart", { cart: null, relatedProducts: [] });
  }
};
///////////////////////////////////


////////////////////////adding a product in to cart

const addCart = async (req, res) => {
  try {
    const maximumQuantityToBuy = 5;
    const { productId, size, quantity } = req.body;
    const users = req.session.userId;
    if (!users) {
      return res.json({ status: false });
    }
    const productData = await product.findById({ _id: productId });
    if (!productData) {
      return res.status(404).json({ error: "Product not found" });
    }
    if (productData.isBlocked) {
      return res.status(404).json({ error: "Product has been removed " });
    }
    const selectedSize = productData.size.find((item) => item.size === size);
    if (!selectedSize || selectedSize.quantity < parseInt(quantity)) {
      return res.status(201).json({ status: "invalidQuantity" });
    }
    if (parseInt(quantity) > maximumQuantityToBuy) {
      return res.json({ status: "maximumQuantity" });
    }
    let userCart = await cart.findOne({ userId: users });
    if (!userCart) {
      const newCart = new cart({ userId: users });
      await newCart.save();
      userCart = newCart;
    }
    const productIndex = userCart.items.findIndex(
      (product) => product.productId == productId && product.size === size
    );
    const qty = parseInt(quantity);
    if (productIndex === -1) {
      userCart.items.push({
        productId: productData._id,
        quantity: qty,
        size: size,
        subTotal: qty * productData.sellingPrice,
      });
    } else {
      if (selectedSize.quantity < userCart.items[productIndex].quantity + qty) {
        return res.json({ status: "out of stock" });
      }
      if (userCart.items[productIndex].quantity + qty > maximumQuantityToBuy) {
        return res.json({ status: "maximumQuantity" });
      }
      userCart.items[productIndex].quantity += qty;
      userCart.items[productIndex].subTotal += qty * productData.sellingPrice;
    }
    let total = 0;
    userCart.items.forEach((element) => {
      total += element.subTotal;
    });
    userCart.total = total;
    await userCart.save();
    res.json({ status: true });
  } catch (error) {
    console.log(error.message, "jjjjjjjjjjjjjjjj");
    res.status(500).json({ error: "Internal server error" });
  }
};
/////////////////////////////////


/////////////////////remove from the cart

const removeItem = async (req, res) => {
  try {
    const { itemId } = req.query;
    const user = req.session.userId;
    const userCart = await cart.findOne({ userId: user });
    const toRemove = userCart.items.find((item) => item._id == itemId);
    const subTotal = toRemove.subTotal;
    const updatedCart = await cart.findOneAndUpdate(
      { userId: user },
      { $pull: { items: { _id: itemId } } }, // Remove the item with the specified _id
      { new: true }
    );
    updatedCart.total -= subTotal;
    await updatedCart.save();
    res.json({ status: true });
  } catch (error) {
    console.error(error.message);
  }
};

////////////////////changing Quantity

const changeQuantity = async (req, res) => {
  try {
    const {
      userId,
      itemid,
      quantity,
      updatingQuantity,
      productId,
      size,
      index,
    } = req.body;
    const userCart = await cart.findOne({ userId: userId });
    const productData = await product.findById(productId);
    const selectedSize = productData.size.find((item) => item.size === size);
    if (!selectedSize || selectedSize.quantity < parseInt(updatingQuantity)) {
      return res.json({ status: "out of stock" });
    }
    const maximumQuantityToBuy = 5;
    if (parseInt(updatingQuantity) > maximumQuantityToBuy) {
      return res.json({ status: "maximumQuantity" });
    }
    userCart.items[index].quantity = parseInt(updatingQuantity);
    userCart.items[index].subTotal =
      parseInt(updatingQuantity) * productData.sellingPrice;
    let total = 0;
    userCart.items.forEach((item) => {
      total += item.subTotal;
    });
    userCart.total = total;
    await userCart.save();
    res.json({
      status: "success",
      total: parseInt(total),
      quantity: updatingQuantity,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
}
///////////////////////////////////////


module.exports = {
  load_cart,
  addCart,
  removeItem,
  changeQuantity,
};

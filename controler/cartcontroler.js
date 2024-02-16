const cart = require("../model/cart_model");
const user = require("../model/user_model");
const product = require("../model/product_model");
const { session } = require("passport");

const load_cart = async (req, res) => {
  const users = req.session.userId;
  const userCart = await cart
    .findOne({ userId: users })
    .populate("items.productId");
  console.log(userCart, "form load cart");
  res.render("cart", { cart: userCart });
};

const addCart = async (req, res) => {
  try {
    const maximumQuantityToBuy=5
    const { productID, size, quantity } = req.body;
    const productData = await product.findById({ _id: productID });
    
    if (!productData) {
      return res.status(404).json({ error: "Product not found" });
    }
    const users = req.session.userId;
    console.log(users);
    if (!users) {
      console.log("inside the users");
      return res.json({ status: false });
    }

    const selectedSize = productData.size.find((item) => item.size === size);

    if (!selectedSize || selectedSize.quantity < parseInt(quantity)) {
      console.log("form here size");
      return res.json({ status: "invalidQuantity" });
    }

    let userCart = await cart.findOne({ userId: users });

    if (!userCart) {
      const newCart = new cart({ userId: users });
      await newCart.save();
      userCart = newCart;
    }
    

    const productIndex = userCart.items.findIndex(
      (product) => product.productId == productID && product.size === size
    );

    const qty = parseInt(quantity);

   
    if (productIndex === -1) {
      userCart.items.push({
        productId: productID,
        quantity: qty,
        size: size,
        subTotal: qty * productData.sellingPrice,
      });
    } else {
      
  console.log(selectedSize.quantity, "   -------  " , qty);
      if(selectedSize.quantity< userCart.items[productIndex].quantity + qty){
        console.log("fuckkkkkkkkkkkkkkkkkkkkkkkk");
       return res.json({status:"out of stock"})
      }
      if( userCart.items[productIndex].quantity+ qty >  maximumQuantityToBuy){
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
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


const removeItem=async (req,res)=>{
  try {
    
    console.log("Hello");
    console.log(req.query);
    const user=req.session.userId
    console.log(user);
    const removeItem = await cart.findOneAndUpdate(
      { userId: user }, 
      { $pull: { items: { _id: req.query.itemId } } }, // Remove the item with the specified _id
      { new: true } )
    console.log(removeItem,"from remove Item");
res.redirect("/cart")

  } catch (error) {
    console.error(error.message)
  }
}

const decrementQuantity = async (req, res) => {
  try {
    console.log(req.body);
      const { userId, itemid, quantity,  updatingQuantity, productId, size, index } = req.body;
    
      const userCart = await cart.findOne({ userId: userId });



      const productData = await product.findById(productId);
     

      const selectedSize = productData.size.find((item) => item.size === size);
      console.log(selectedSize,"size");
      if (!selectedSize || selectedSize.quantity < parseInt(updatingQuantity)) {
          return res.json({ status: "out of stock" });
      }

    
      const maximumQuantityToBuy = 5;
      if (parseInt(updatingQuantity) > maximumQuantityToBuy) {
          return res.json({ status: "maximumQuantity" });
      }

      
      userCart.items[index].quantity = parseInt( updatingQuantity);
      userCart.items[index].subTotal = parseInt( updatingQuantity) * productData.sellingPrice;

      // Recalculate total
      let total = 0;
      userCart.items.forEach((item) => {
          total += item.subTotal;
      });
      userCart.total = total;
      console.log(total,"kkkkkkkkkkkkkkkkkkkkkkk");

      // Save the updated cart
      await userCart.save();

      // Send response
      res.json({
          status: "success",
          total: parseInt( total),
          quantity:updatingQuantity

          // updatedSubtotal: parseInt( updatingQuantity) * productData.sellingPrice
      });
  } catch (error) {
      console.log(error.message);
      res.status(500).json({ status: "error", message: error.message });
  }
}



module.exports = {
  load_cart,
  addCart,
  removeItem,decrementQuantity
};

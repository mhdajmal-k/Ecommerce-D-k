const category = require("../model/category");

const load_category = async (req, res) => {
  try {
    const categories = await category.find({});
    res.status(201).render("categories", { categoryData: categories });
  } catch (error) {
    res.status(400).send(error);
  }
};

const load_Addcategory = (req, res) => {
  try {
    res.render("addCategory");
  } catch (error) {
    res.status(400).send(error);
  }
};

const addCategory = async (req, res) => {
  try {
    const { categoryName, Description } = req.body;
    if (req.body) {
      const existingCategory = await category.findOne({
        categoryTitle: { $regex: new RegExp("^" + categoryName + "$", "i") },
      });
      if (existingCategory) {
        res.render("addCategory", {
          message: "Category already existing!...",
        });
      } else {
        const savingCategory = new category({
          categoryTitle: categoryName,
          description: Description,
        });
        savedCategory = await savingCategory.save();
        if (savedCategory) {
          res.redirect("/admin/category");
        } else {
          res.render("editCategory", { message: "existing category!" });
        }
      }
    } else {
      res.render("editCategory", { message: "existing category!" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const load_editCategory = async (req, res) => {
  try {
    const id = req.query.id;
    if (id) {
      const categoryData = await category.findById(id);
      console.log(categoryData._id + "got");
    
      
      if (categoryData) {
        res.render("editCategory", { categories: categoryData });
      }
    } else {
      res.redirect("/admin/category");
    }
  } catch (error) {
    console.log(error.message);
  }
};


const editCategory=async(req,res)=>{
  try {
    const {categoryName,Description,id}=req.body
    console.log(Description);
    console.log(id+"id get ");
    const updateCategory=await category.findByIdAndUpdate({_id:id},{$set:{
categoryTitle:categoryName,
description:Description
    }})
    if(updateCategory){
      console.log("success");
      res.redirect("/admin/category")
    }
    res.send("ok")
  } catch (error) {
    console.log(error.message)
  }
}

module.exports = {
  load_Addcategory,
  addCategory,
  load_category,
  load_editCategory,
  editCategory
};

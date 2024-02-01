const category = require("../model/category");



///////////////////////// category page//////////////////////////////////////////////


const load_category = async (req, res) => {
  try {
    const categories = await category.find({});
    res.render("categories", { categoryData: categories });
  } catch (error) {
    res.status(400).send(error);
  }
};

///////////////////////// category adding page//////////////////////////////////////////////


const load_Addcategory = (req, res) => {
  try {
    res.render("addCategory");
  } catch (error) {
    res.status(400).send(error);
  }
};


///////////////////////// post addcategory//////////////////////////////////////////////


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


///////////////////////// edit page//////////////////////////////////////////////


const load_editCategory = async (req, res) => {
  try {
    const id = req.query.id;
    if (id) {
      const categoryData = await category.findById(id);    
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



///////////////////////// edit post page/////////////////////////////////////////////


const editCategory=async(req,res)=>{
  try {
    const {categoryName,Description,id}=req.body
    const updateCategory=await category.findByIdAndUpdate({_id:id},{$set:{
categoryTitle:categoryName,
description:Description
    }})
    if(updateCategory){
      console.log("success");
      res.redirect("/admin/category")
    }
  } catch (error) {
    console.log(error.message)
  }
}



/////////////////////////  soft delete //////////////////////////////////////////////

const listAndUnList=async(req,res)=>{
  try {

    const id=req.query.id
    console.log(id)
    const _id=await category.findById({_id:id})
    console.log(_id)
    if(_id){
      if(_id.isList==true){
        const unList=await category.updateOne({_id},{$set:{isList:false}})
        res.redirect("/admin/category")
      }else if(_id.isList==false){
        const List=await category.updateOne({_id},{$set:{isList:true}})
        res.redirect("/admin/category")
      }

    }else{
      res.render("categories",{message:"invalid id!"})
    }
  } catch (error) {
    console.log(error.message)
  }
}



module.exports = {
  load_Addcategory,
  addCategory,
  load_category,
  load_editCategory,
  editCategory,
  listAndUnList
};

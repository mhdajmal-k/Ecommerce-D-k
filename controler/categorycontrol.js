const category = require("../model/category");

const load_category = (req, res) => {
  try {
    res.status(201).render("categories");
  } catch (error) {
    res.status(400).send(error);
  }
};

const load_Addcategory = (req, res) => {
  try {
    res.status(201).render("editCategory");
  } catch (error) {
    res.status(400).send(error);
  }
};

const addCategory = async (req, res) => {
  try {
    const { categoryName, Description } = req.body;
    console.log(categoryName, Description);

    if (req.body) {
      const existingCategory = await category.findOne({
        categoryTitle: { $regex: new RegExp("^" + categoryName + "$", "i") },
      });
      console.log(existingCategory+"checking..");
      if (existingCategory) {
        res.render("editCategory", {
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
          res.render("editCategory",{ message: "existing category!" });
        }
      }
    } else {
      res.render("editCategory", { message: "existing category!" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  load_Addcategory,
  addCategory,
  load_category,
};

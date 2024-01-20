const admin_dashboard = async (req, res) => {
  try {
    res.render("admin_panel");
  } catch (error) {}
};
const load_product = async (req, res) => {
  try {
    res.render("product_list");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  admin_dashboard,
  load_product,
};

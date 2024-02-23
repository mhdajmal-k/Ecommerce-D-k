const Product = require("../../model/product_model");

const pagination = async (req, res) => {
    try {
        const productCount = await Product.find({}).count()
        const page = req.query.page || 1;
        const pageSize =productCount ;
        const skip = (page - 1) * pageSize;
        const totalPage = Math.ceil(productCount / pageSize);
        console.log(productCount,"its a product count");
        console.log(page,"its a page");
        console.log(pageSize,"its a page size");
        console.log(skip,"its page skip");
        console.log(totalPage,"its toatal page");
        return { skip, page , pageSize, totalPage};
    } catch (error) {
        throw new Error("Pagination error: " + error.message);
    }
};

module.exports = { pagination };

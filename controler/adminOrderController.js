const load_orders=async(req,res)=>{
try {
    console.log("hello")
    res.render("orderList")
} catch (error) {
    console.error(error.message)
}
}

module.exports={load_orders}

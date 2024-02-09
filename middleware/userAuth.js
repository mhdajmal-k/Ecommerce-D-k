const user=require("../model/user_model")


//user authentication check



const isLogin=(req,res,next)=>{
    console.log(req.session.user,"form is");
if(req.session.user==true){
    console.log(req.session.user,"form is login");

    next()
}else{
    res.redirect("/login")
}
}

const isLogout=(req,res,next)=>{
 

   console.log(  req.session.user,"from the isLogout");
if(req.session.user==true){
    console.log('inside the true');
    res.redirect("/")
}else{
    console.log('inside the false');
    next()
}
}

const isBlocked= async (req,res,next)=>{
    if(req.session.userId){
        const block=await user.findById(req.session.userId)
        console.log(block,"fuckkkkkkkkkkkkkkkkkkkkkkkk");
        if(block.is_block==true){

            res.render("login_page",{message:"opps you have been blocked" })
        }else{
            next()
        }
    }else{
        next()
    }
    
    
  
}


module.exports={isLogin, isLogout,isBlocked}
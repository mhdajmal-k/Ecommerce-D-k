const user=require("../model/user_model")


//user authentication check



const isLogin=(req,res,next)=>{

if(req.session.user==true){


    next()
}else{
    
    res.redirect("/login")
}
}

const isLogout=(req,res,next)=>{
 

if(req.session.user==true){

    res.redirect("/")
}else{
    next()
}
}

const isBlocked= async (req,res,next)=>{
    if(req.session.userId){
        const block=await user.findById(req.session.userId)
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
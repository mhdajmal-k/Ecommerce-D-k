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
    console.log('inside the true');
    res.redirect("/")
}else{
    console.log('inside the false');
    next()
}
}


module.exports={isLogin, isLogout}
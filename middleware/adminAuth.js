
// adminAuth.js
const sessionChecker = (req, res, next) => {
    
        if (req.session.adminOn==true) {
     
      
            next();
        } else {
           
            res.redirect('/admin');
            
        }
        

};



module.exports = { sessionChecker};

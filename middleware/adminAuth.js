
// adminAuth.js
const sessionChecker = (req, res, next) => {
    
        if (req.session.id) {
     
      
            next();
        } else {
           
            res.redirect('/admin');
            
        }
        

};

module.exports = { sessionChecker };

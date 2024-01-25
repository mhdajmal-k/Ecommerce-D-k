
// adminAuth.js
const sessionChecker = (req, res, next) => {
    
        if (req.session.id) {
     
            console.log(req.session.id)
            next();
        } else {
            console.log(req.session.id+"adminAuth")
            res.redirect('/admin');
               console.log("heloo")
            next()
        }
        
    
   
};

module.exports = { sessionChecker };

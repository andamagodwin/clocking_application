module.exports.isAuthenticated = (req, res,next) => {
    if (req.session.user) {
        return next();
    }else{
        res.redirect("/signin")
    }
    
    
}
module.exports.isAdmin = (req, res,next) => {
    if (req.session.user&&req.session.user.role=="admin") {
        return next();
    } else {
        res.redirect("/dashboard");
    }
    
    
}
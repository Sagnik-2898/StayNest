const User = require('../Models/user')

module.exports.rendersignupform = (req,res)=>{
    res.render("users/signup.ejs")
}

module.exports.signup = async(req,res)=>{
    try{
        let{username,email,password} = req.body;
    const newUser = new User({email,username});
    const registeredUser = await User.register(newUser,password)
    console.log(registeredUser);
    req.login(registeredUser,(err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","Welcome to StayNest!")
        let redirectUrl = res.locals.redirectUrl || "/listings"
    res.redirect(redirectUrl)
    })
    
    }catch(err){
        req.flash("error",err.message);
        res.redirect("/signup")
    }
}

module.exports.renderLoginform = (req,res)=>{
    res.render("users/login.ejs")
}

module.exports.login = async(req,res)=>{
    req.flash("success","Welcome back!")
    let redirectUrl = res.locals.redirectUrl || "/listings"
    res.redirect(redirectUrl);
}

module.exports.logout = (req,res)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","You are logged out")
        res.redirect("/listings");
    })
}
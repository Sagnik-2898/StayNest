const express = require('express');
const app = express();
const port = 8080;
const mongoose = require('mongoose');
const path = require('path');
const methodoverride = require('method-override');
const ejsMate = require('ejs-mate');
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const ExpressError = require('./utils/ExpressError');
const listingRouter = require('./routes/listing')
const reviewRouter = require('./routes/review')
const userRouter = require('./routes/user')
const session = require('express-session')
const flash = require('connect-flash')

//Passport
const passport = require("passport");
const LocalStrategy = require("passport-local")
const User = require("./Models/user")



app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }))
app.use(methodoverride("_method"))
app.engine("ejs", ejsMate)
app.use(express.static(path.join(__dirname, "/public")))




//cookie session options
const sessionOptions = {
    secret:"Sagnik2003",
    resave:false,
    saveUninitialized : true,
    cookie:{
        expires: Date.now() + 7*24*60*60*1000,
        maxAge : 7*24*60*60*1000,
        httpOnly : true
    }
}



app.get("/",(req,res)=>{
    res.send("Hi I am root")
})


app.use(flash()) // flash messages
app.use(session(sessionOptions)) //Session middleware

//passport middleware

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// app.get("/demoUser",async (req,res)=>{
//     let fakeUser = new User({
//         email:"hanasan@gmail.com",
//         username:"Nakayama Hana",
//     })

//     let regUser = await User.register(fakeUser,"helloworld");
//     res.send(regUser);
// })



app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})






main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}





// router middleware

app.use("/listings",listingRouter)
app.use("/listings/:id/reviews",reviewRouter)
app.use("/",userRouter);





//Error Middleware
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"))
})

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something Went Wrong" } = err;
    res.render("error.ejs", { err })
    
})



app.listen(port, () => {
    console.log(`Server is listening on Port ${port}`);
});

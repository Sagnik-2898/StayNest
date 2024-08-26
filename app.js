if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const express = require('express');
const app = express();
const port = 8080;
const mongoose = require('mongoose');
const path = require('path');
const methodoverride = require('method-override');
const ejsMate = require('ejs-mate');
const dbURL=process.env.ATLASDB_URL;
const ExpressError = require('./utils/ExpressError');
const listingRouter = require('./routes/listing')
const reviewRouter = require('./routes/review')
const userRouter = require('./routes/user')
const session = require('express-session')
const MongoStore = require('connect-mongo')
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

// Mongo Sesstion Store

const store = MongoStore.create({
    mongoUrl: dbURL,
    crypto:{
        secret:process.env.SECRET
    },
    touchAfter: 24*3600
})

store.on("error",()=>{
    console.log("ERROR in MONGO SESSION STORE",err);
})

//cookie session options
const sessionOptions = {
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized : true,
    cookie:{
        expires: Date.now() + 7*24*60*60*1000,
        maxAge : 7*24*60*60*1000,
        httpOnly : true
    }
}





app.get("/",(req,res)=>{
    res.redirect("/listings")
})




app.use(flash()) // flash messages
app.use(session(sessionOptions)) //Session middleware

//passport middleware

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user
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
    await mongoose.connect(dbURL);
}

app.get("/privacy",(req,res)=>{
    res.render("listings/privacy.ejs")
})


app.get("/terms",(req,res)=>{
    res.render("listings/terms.ejs")
})



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

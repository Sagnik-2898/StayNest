const express = require('express');
const app = express();
const port = 8080;
const mongoose = require('mongoose');
const path = require('path');
const methodoverride = require('method-override');
const ejsMate = require('ejs-mate');
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const ExpressError = require('./utils/ExpressError');
const listings = require('./routes/listing')
const reviews = require('./routes/review')
const session = require('express-session')
const flash = require('connect-flash')

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }))
app.use(methodoverride("_method"))
app.engine("ejs", ejsMate)
app.use(express.static(path.join(__dirname, "/public")))
app.use(flash())




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

app.use(session(sessionOptions))
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

app.use("/listings",listings)
app.use("/listings/:id/reviews",reviews)





//Error Middleware
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"))
})

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something Went Wrong" } = err;
    res.render("error.ejs", { err })
    
})





// app.get("/testListing",async (req,res)=>{
//     let sampleListing = new Listing({
//         title:"My new Villa",
//         description:"Heyy Enjoy my new Villa",
//         price:6000,
//         location:"Puri",
//         country:"India"
//     })
//     await sampleListing.save();
//     console.log("Saved");
//     res.send("Successfull Sending");
// });

app.listen(port, () => {
    console.log(`Server is listening on Port ${port}`);
});

const express = require('express');
const app = express();
const port = 8080;
const mongoose = require('mongoose');
const ejs = require('ejs');
const path = require('path');
const Listing = require("./Models/listing");
const methodoverride = require('method-override');
const ejsMate = require('ejs-mate');
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const wrapAsync = require('./utils/wrapAsync');
const ExpressError = require('./utils/ExpressError');
const { listingSchema, reviewSchema } = require('./schema')
const Review = require('./Models/review');
const listings = require('./routes/listing')
const reviews = require('./routes/review')

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }))
app.use(methodoverride("_method"))
app.engine("ejs", ejsMate)
app.use(express.static(path.join(__dirname, "/public")))

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

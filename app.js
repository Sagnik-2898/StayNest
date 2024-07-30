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
const review = require('./Models/review');

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


//Root Route
app.get("/", (req, res) => {
    res.send("Hello I am Listening");
});

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);

    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",")
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}


const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);

    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",")
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}





//Index Route
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
}));

//Create Route

app.get("/listings/new", (req, res) => {
    res.render("listings/new")
})

app.post("/listings", validateListing, wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings")
})
)

//Update Route

app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing })
}));

app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
    if (!req.body.listing) {
        throw new ExpressError(400, "Send Valid Data for Listing")
    }
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing })
    res.redirect(`/listings/${id}`)
}))

//DELETE Route

app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedList = await Listing.findByIdAndDelete(id)
    console.log(deletedList)
    res.redirect("/listings")
}))

//Reviews
//Post Route

app.post("/listings/:id/reviews", validateReview, 
    wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`)
})
);

//Delete Review Route

app.delete("/listings/:id/reviews/:reviewID",wrapAsync(async(req,res)=>{
    let {id,reviewID} = req.params;

    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewID}});
    await Review.findByIdAndDelete(reviewID);

    res.redirect(`/listings/${id}`)
}))

//Show Route
app.get("/listings/:id", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show", { listing })
})




//Error Middleware
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"))
})

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something Went Wrong" } = err;
    res.render("error.ejs", { err })
    
})

//ERR





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

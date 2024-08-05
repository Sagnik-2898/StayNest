// Listing Routes

const express = require('express');
const router = express.Router();
const Listing = require("../Models/listing");
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const { listingSchema, reviewSchema } = require('../schema')


const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);

    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",")
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}


//Index Route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//Create Route

router.get("/new", (req, res) => {
    res.render("listings/new.ejs")
})

router.post("/", validateListing, wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success", "New Listing Added!")
    res.redirect("/listings")
})
)

//Update Route

router.get("/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist")
        res.redirect("/listings")
    }
    res.render("listings/edit.ejs", { listing })
}));

router.put("/:id", validateListing, wrapAsync(async (req, res) => {
    if (!req.body.listing) {
        throw new ExpressError(400, "Send Valid Data for Listing")
    }
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing })
    req.flash("success", "Listing Updated!")
    res.redirect(`/${id}`)
}))

//DELETE Route

router.delete("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedList = await Listing.findByIdAndDelete(id)
    console.log(deletedList)
    req.flash("success", "Listing Deleted!")
    res.redirect("/listings")
}))

//Show Route
router.get("/:id", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing){
        req.flash("error","Listing you requested for does not exist")
        res.redirect("/listings")
    }
    res.render("listings/show", { listing })
})

module.exports = router;
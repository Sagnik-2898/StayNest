// Listing Routes

const express = require('express');
const router = express.Router();
const Listing = require("../Models/listing");
const wrapAsync = require('../utils/wrapAsync');
const {isLoggedIn} = require('../middleware')
const {isOwner} = require('../middleware')
const {validateListing} = require('../middleware')

//Index Route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//Create Route

router.get("/new",isLoggedIn, (req, res) => {
    res.render("listings/new.ejs")
})

router.post("/", validateListing, wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing Added!")
    res.redirect("/listings")
})
)

//Edit route
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist")
        res.redirect("/listings")
    }
    res.render("listings/edit.ejs", { listing })
}));


//Update Route
router.put("/:id",isLoggedIn,isOwner, validateListing, wrapAsync(async (req, res) => {
    // if (!req.body.listing) {
    //     throw new ExpressError(400, "Send Valid Data for Listing")
    // }
    await Listing.findByIdAndUpdate(id, { ...req.body.listing })
    req.flash("success", "Listing Updated!")
    res.redirect(`/listings/${id}`)
}))

//DELETE Route

router.delete("/:id",isLoggedIn,isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedList = await Listing.findByIdAndDelete(id)
    console.log(deletedList)
    req.flash("success", "Listing Deleted!")
    res.redirect("/listings")
}))

//Show Route
router.get("/:id", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist")
        res.redirect("/listings")
    }
    res.render("listings/show", { listing })
})

module.exports = router;
const Listing = require("../Models/listing");


module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}

module.exports.renderNewform = (req, res) => {
    res.render("listings/new.ejs")
}

module.exports.showListings = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist")
        res.redirect("/listings")
    }
    res.render("listings/show", { listing })
}

module.exports.createListing = async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing Added!")
    res.redirect("/listings")
}

module.exports.renderEditform = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist")
        res.redirect("/listings")
    }
    res.render("listings/edit.ejs", { listing })
}

module.exports.editListing = async (req, res) => {
    await Listing.findByIdAndUpdate(id, { ...req.body.listing })
    req.flash("success", "Listing Updated!")
    res.redirect(`/listings/${id}`)
}

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    let deletedList = await Listing.findByIdAndDelete(id)
    console.log(deletedList)
    req.flash("success", "Listing Deleted!")
    res.redirect("/listings")
}
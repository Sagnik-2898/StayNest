const express = require('express');
const router = express.Router({ mergeParams: true });
const Listing = require("../Models/listing");
const wrapAsync = require('../utils/wrapAsync');
const Review = require('../Models/review.js');
const { validateReview, isLoggedIn } = require('../middleware.js')

// Reviews
// Post Route
const isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    console.log(`Listing ID: ${id}`);
    console.log(`Review ID: ${reviewId}`);

    const review = await Review.findById(reviewId);
    console.log('Review Found:', review);

    if (!review) {
        req.flash("error", "Review not found");
        return res.redirect(`/listings/${id}`);
    }

    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}


router.post("/", isLoggedIn, validateReview, wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    console.log(newReview)
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success", "New Review Added!");
    res.redirect(`/listings/${listing._id}`);
}));

// Delete Review Route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
}));


module.exports = router;

const express = require('express');
const router = express.Router({ mergeParams: true });
const Listing = require("../Models/listing");
const wrapAsync = require('../utils/wrapAsync');
const Review = require('../Models/review.js');
const { validateReview, isLoggedIn,isReviewAuthor } = require('../middleware.js')
const reviewcontroller = require('../controllers/reviews.js')

// Reviews
// Post Route

router.post("/", isLoggedIn, validateReview, wrapAsync(reviewcontroller.createReview));

// Delete Review Route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewcontroller.destroyReview));


module.exports = router;

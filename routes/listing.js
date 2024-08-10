const express = require('express');
const router = express.Router();
const Listing = require("../Models/listing");
const wrapAsync = require('../utils/wrapAsync');
const { isLoggedIn, isOwner, validateListing } = require('../middleware');
const listingController = require('../controllers/listings');
const multer = require('multer');
const { storage } = require('../cloudConfig');
const upload = multer({ storage });

router
    .route("/")
    .get(wrapAsync(listingController.index)) // Index Route
    .post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingController.createListing)) // Create Route


// Form route
router.get("/new", isLoggedIn, listingController.renderNewform);

router
    .route("/:id")
    .put(isLoggedIn, isOwner,
        upload.single('listing[image]'), validateListing, wrapAsync(listingController.editListing)) // Update Route
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing)) // DELETE Route
    .get(listingController.showListings); // Show Route

// Edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditform));

module.exports = router;

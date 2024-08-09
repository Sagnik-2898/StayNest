// Listing Routes

const express = require('express');
const router = express.Router();
const Listing = require("../Models/listing");
const wrapAsync = require('../utils/wrapAsync');
const {isLoggedIn} = require('../middleware')
const {isOwner} = require('../middleware')
const {validateListing} = require('../middleware')
const listingController = require('../controllers/listings')

router
    .route("/")
    .get( wrapAsync(listingController.index)) //Index Route
    .post(isLoggedIn, validateListing, wrapAsync(listingController.createListing)) // Create Route

//Form
router.get("/new",isLoggedIn,listingController.renderNewform);


router
    .route("/:id")
    .put(isLoggedIn,isOwner, validateListing, wrapAsync(listingController.editListing))//Update Route
    .delete(isLoggedIn,isOwner, wrapAsync(listingController.deleteListing))//DELETE Route
    .get(listingController.showListings)//Show Route


//Edit route
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.renderEditform));




module.exports = router;
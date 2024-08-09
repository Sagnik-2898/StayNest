const express = require('express');
const router = express.Router();
const User = require("../Models/user");
const wrapAsync = require('../utils/wrapAsync');
const passport = require("passport");
const { saveRedirectUrl } = require('../middleware');
const usercontroller = require('../controllers/users')

router
    .route("/signup")
    .get(usercontroller.rendersignupform)
    .post(saveRedirectUrl,wrapAsync(usercontroller.signup))

router.route("/login")
    .get(usercontroller.renderLoginform)
    .post(saveRedirectUrl, passport.authenticate("local",{failureRedirect:'/login',failureFlash:true}) , usercontroller.login)

router.get("/logout", usercontroller.logout)

module.exports = router;
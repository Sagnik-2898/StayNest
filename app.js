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

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}))
app.use(methodoverride("_method"))
app.engine("ejs",ejsMate)
app.use(express.static(path.join(__dirname,"/public")))

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

//Index Route
app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
});

//Create Route

app.get("/listings/new",(req,res)=>{
    res.render("listings/new")
})

app.post("/listings",async(req,res)=>{
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings")
})

//Update Route

app.get("/listings/:id/edit",async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing})
})

app.put("/listings/:id",async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing})
    res.redirect(`/listings/${id}`)
})

//DELETE Route

app.delete("/listings/:id",async(req,res)=>{
    let {id} = req.params;
    let deletedList = await Listing.findByIdAndDelete(id)
    console.log(deletedList)
    res.redirect("/listings")
})


//Show Route
app.get("/listings/:id",async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show",{listing})
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

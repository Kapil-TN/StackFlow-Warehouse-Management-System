const dns = require("dns");
dns.setServers(["1.1.1.1"]);
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();
const port = 5000;
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully")
    })
    .catch((error) => {
        console.log("MongoDB connection failed:", error.message);
    });
app.listen(port, () =>{
    console.log(`Server running on port ${port}`);
});
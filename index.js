require("dotenv").config();
const port = process.env.PORT || 5000;
const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors')
const app = express();
const cookieParser = require('cookie-parser');

try {
    mongoose
        .connect(process.env.CONNECTION_STRING)
        .then(() => console.log("CONNECTED TO DATABASE"))
        .catch((err) => console.log(err));

    app.use(cors({
        origin: [
            "http://localhost:3000",
            "http://localhost:5000",
        ],
        credentials: true
    }));

    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));


    app.use(require("./controllers/userController"));
    app.use(require("./controllers/favoriteController"));
    app.use(require("./controllers/authController"));
    app.use(require("./controllers/recipeController"));

    app.listen(port, () => {
        console.log(`SERVER STATE IS ${process.env.NODE_ENV.toUpperCase()} MODE`)
        console.log(`SERVER IS RUNNING ON ${port}`);
    });
} catch (error) {
    console.log(error);

}
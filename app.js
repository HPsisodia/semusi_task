const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require('path');
const cookieParser = require('cookie-parser')

global.appRoot = path.resolve(__dirname);

// Logs Cache controlling Https

require("dotenv").config();

const app = express();

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser())

// const static_path = path.join(__dirname, '/public/images');
// console.log(__dirname, '/views/images');
app.use(express.static('public'));
app.set("views", path.join(__dirname, "/public/views"));
app.set("view engine", "hbs");

const authRoute = require('./routes/auth');
const dashboardRoute = require('./routes/dashboard');

app.use("/", authRoute);

app.use("/", dashboardRoute);

const PORT = process.env.PORT || 3000;
const DBURL = process.env.DBURL ////add mongo database URI here

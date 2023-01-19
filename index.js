const express = require("express");
const connectDB = require("./CONFIG/db.js");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config({ path: "./.env" });

// importing router
const user=require("./router/user.js");
const projects = require("./router/project");
const logs = require("./router/logs");

// creating connection with DB
connectDB();


const app=express();
app.enable("trust proxy");

// DEVELOPMENT environment morgan logs
// if (process.env.NODE_ENV === "DEVELOPMENT") {
app.use(morgan("tiny"));
//}

app.use(cors());

// adding static folder
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json({ limit: "1mb", extended: true }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));
app.use(express.json());

// Users Routing
app.use('/user',user);
app.use("/projects", projects);
app.use("/logs", logs);

// error handling for all routes which are not define
app.all("*", (req, res, next) => {
    res.status(400).json({
      status: 0,
      data: {
        err: {
          generatedTime: new Date(),
          errMsg: "No Route Found",
          msg: "No Route Found",
          type: "Express Error",
        },
      },
    });
  
    next();
  });
const PORT = process.env.PORT || 5000;

module.exports = app.listen(PORT, () => console.log(`active on port ${PORT}`));


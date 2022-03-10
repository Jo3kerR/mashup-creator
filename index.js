const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv/config");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const queryRoute = require("./routes");
app.use("/create", queryRoute);

app.get("/", (req, res) => {
  res.render("home");
});

mongoose.connect(process.env.DB_CONNECT, () => console.log("DB connected"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port ${port}`));

module.exports = app;
